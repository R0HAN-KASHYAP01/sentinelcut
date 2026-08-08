"""

// backend/app/services/audio_censorship_service.py
Applies beep censorship to detected profanity, per MVP Scope §2 ("Beep,
Mute" — beep only for MVP, see decision log). Downloads the original from
Supabase Storage, processes locally in a temp dir via FFmpeg + PyDub,
uploads the censored result back to Storage, and returns its storage path.

Video files (mp4/mov/mkv): audio extracted, beeped, re-muxed with the
ORIGINAL video stream copied untouched (-c:v copy) to preserve resolution,
frame rate, and sync exactly.
Audio-only files (mp3/wav): beeped audio IS the final output, no re-mux.
"""

import os
import subprocess
import tempfile
import uuid
from typing import List

from pydub import AudioSegment
from pydub.generators import Sine

from app.config import settings
from supabase import create_client

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

FFMPEG = settings.FFMPEG_PATH


def _run_ffmpeg(cmd):
    """Runs an ffmpeg command and raises a clear error with ffmpeg's own
    stderr output if it fails — subprocess.CalledProcessError alone hides
    the actual reason ffmpeg exited non-zero."""
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(
            f"ffmpeg failed (exit {result.returncode}):\n"
            f"CMD: {' '.join(cmd)}\n"
            f"STDERR:\n{result.stderr}"
        )
    return result

BEEP_FREQUENCY_HZ = 1000
VIDEO_EXTENSIONS = {"mp4", "mov", "mkv"}
AUDIO_EXTENSIONS = {"mp3", "wav", "aac", "flac"}


def _generate_beep(duration_ms: int) -> AudioSegment:
    return Sine(BEEP_FREQUENCY_HZ).to_audio_segment(duration=duration_ms).apply_gain(-3)


def _apply_beeps(audio: AudioSegment, detections: List[dict]) -> AudioSegment:
    # Process in timestamp order so slicing stays correct as we rebuild the track
    for d in sorted(detections, key=lambda x: x["start"]):
        start_ms = int(d["start"] * 1000)
        end_ms = int(d["end"] * 1000)
        duration_ms = max(end_ms - start_ms, 1)
        beep = _generate_beep(duration_ms)
        audio = audio[:start_ms] + beep + audio[end_ms:]
    return audio


def censor_file(original_storage_path: str, user_id: str, file_type: str, detections: List[dict]) -> str:
    """
    detections: list of dicts with 'start' and 'end' in seconds (float).
    Returns the new storage_path of the censored file in the 'uploads' bucket.
    """
    ext = file_type.lower()
    is_video = ext in VIDEO_EXTENSIONS

    with tempfile.TemporaryDirectory() as tmp_dir:
        local_input = os.path.join(tmp_dir, f"input.{ext}")
        local_audio = os.path.join(tmp_dir, "audio.wav")
        local_censored_audio = os.path.join(tmp_dir, "censored_audio.wav")
        local_output = os.path.join(tmp_dir, f"output.{ext}")

        # 1. Download original from Supabase Storage
        file_bytes = supabase.storage.from_("uploads").download(original_storage_path)
        with open(local_input, "wb") as f:
            f.write(file_bytes)

        # 2. Extract audio track via ffmpeg (works for both video and audio-only input)
        _run_ffmpeg(
            [FFMPEG, "-y", "-i", local_input, "-vn", "-acodec", "pcm_s16le",
             "-ar", "44100", "-ac", "2", local_audio]
        )

        # 3. Apply beep over each detection's timestamp range
        audio = AudioSegment.from_wav(local_audio)
        audio = _apply_beeps(audio, detections)
        audio.export(local_censored_audio, format="wav")

        if is_video:
            # 4. Re-mux: original video stream (copied, untouched) + censored audio
            _run_ffmpeg(
                [FFMPEG, "-y", "-i", local_input, "-i", local_censored_audio,
                 "-map", "0:v:0", "-map", "1:a:0",
                 "-c:v", "copy", "-c:a", "aac", "-shortest", local_output]
            )
        else:
            # Audio-only input: censored audio IS the final output
            _run_ffmpeg([FFMPEG, "-y", "-i", local_censored_audio, local_output])

        # 5. Upload censored result back to Supabase Storage
        censored_path = f"{user_id}/censored/{uuid.uuid4()}.{ext}"
        with open(local_output, "rb") as f:
            supabase.storage.from_("uploads").upload(
                censored_path, f.read(),
                file_options={"content-type": f"video/{ext}" if is_video else f"audio/{ext}"},
            )

        return censored_path