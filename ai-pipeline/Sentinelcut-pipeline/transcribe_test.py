import json
from faster_whisper import WhisperModel

model = WhisperModel("medium", device="cpu", compute_type="int8")

segments, info = model.transcribe(
    "HINDI_SAM.mp4",
    beam_size=5,
    word_timestamps=True,
    task="transcribe",
    language="hi",
    vad_filter=False,
    condition_on_previous_text=False
)

results = []
for segment in segments:
    for word in segment.words:
        results.append({
            "word": word.word.strip(),
            "start": round(word.start, 2),
            "end": round(word.end, 2),
            "confidence": round(word.probability, 2)
        })
    print(f"[Segment] {segment.text}")

with open("transcript_output.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(results)} words to transcript_english2.json")