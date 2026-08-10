import json

with open("transcript_output.json", "r", encoding="utf-8") as f:
    transcript = json.load(f)

words = [entry["word"] for entry in transcript]
print(" ".join(words))