"""

// backend/app/services/export_service.py
Generates export artifacts per MVP Scope §2: censored video/audio (signed
Supabase Storage URL), transcript (.txt), detection metadata (.json).

NOTE: generate_transcript_text() currently builds a timestamped listing of
DETECTED WORDS ONLY, not a full spoken-word transcript — P1's real ASR
pipeline (Step 12) isn't wired in yet, so full transcript text doesn't
exist. Replace this with the real transcript once available; the export
endpoint shape (route, response format) will not need to change.
"""

from typing import List

from app.config import settings
from supabase import create_client

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

SIGNED_URL_EXPIRY_SECONDS = 3600  # 1 hour


def get_signed_url(storage_path: str) -> str:
    result = supabase.storage.from_("uploads").create_signed_url(
        storage_path, SIGNED_URL_EXPIRY_SECONDS
    )
    return result["signedURL"] if "signedURL" in result else result.get("signed_url")


def generate_transcript_text(detections: List[dict]) -> str:
    """
    PLACEHOLDER transcript format until Step 12 wires in P1's real ASR
    transcript. Lists each detection's word and timestamp in order.
    """
    lines = ["SentinelCut — Detected Profanity Transcript", "=" * 45, ""]
    if not detections:
        lines.append("(no detections)")
    for d in sorted(detections, key=lambda x: x["start"]):
        status_tag = "" if d["status"] == "active" else " [REMOVED BY USER]"
        lines.append(
            f"[{d['start']:.2f}s - {d['end']:.2f}s] "
            f"\"{d['word']}\" ({d['language']}, {d['severity']}){status_tag}"
        )
    return "\n".join(lines)