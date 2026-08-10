import json
from rapidfuzz import fuzz
from normalize import normalize_word

with open("transcript_output.json", "r", encoding="utf-8") as f:
    transcript = json.load(f)

with open("profanity_dict.json", "r", encoding="utf-8") as f:
    profanity_dict = json.load(f)

with open("phrase_dict.json", "r", encoding="utf-8") as f:
    phrase_dict = json.load(f)

# --- Single-word lookup ---
variant_lookup = {}
for canonical, entry in profanity_dict.items():
    for variant in entry["variants"]:
        variant_lookup[normalize_word(variant)] = entry

FUZZY_THRESHOLD = 88
MIN_WORD_LENGTH = 4
SAFE_WORDS = {"मर्द"}

def fuzzy_match(word: str):
    if len(word) < MIN_WORD_LENGTH or word in SAFE_WORDS:
        return None, 0
    best_score = 0
    best_entry = None
    for variant_normalized, entry in variant_lookup.items():
        score = fuzz.ratio(word, variant_normalized)
        if score > best_score:
            best_score = score
            best_entry = entry
    if best_score >= FUZZY_THRESHOLD:
        return best_entry, best_score
    return None, best_score

# --- Phrase lookup (multi-word) ---
phrase_variant_lookup = {}
for canonical, entry in phrase_dict.items():
    for variant in entry["variants"]:
        # normalize but keep spaces, since phrases are multi-word
        cleaned = " ".join(normalize_word(w) for w in variant.split())
        phrase_variant_lookup[cleaned] = entry

def check_phrases(words_list):
    """Slides a window of 2-4 words across the transcript looking for phrase matches."""
    phrase_detections = []
    n = len(words_list)
    for window_size in (2, 3, 4, 5):
        for i in range(n - window_size + 1):
            window = words_list[i:i + window_size]
            combined = " ".join(normalize_word(w["word"]) for w in window)
            if combined in phrase_variant_lookup:
                match = phrase_variant_lookup[combined]
                phrase_detections.append({
                    "word": " ".join(w["word"] for w in window),
                    "normalized": combined,
                    "canonical": match["canonical"],
                    "language": match["language"],
                    "severity": match["severity"],
                    "start": window[0]["start"],
                    "end": window[-1]["end"],
                    "source": "phrase",
                    "confidence": 1.0,
                    "variants": match["variants"]
                })
    return phrase_detections

# --- Run single-word detection ---
detections = []
for word_entry in transcript:
    raw_word = word_entry["word"].strip()
    normalized = normalize_word(raw_word)

    if normalized in variant_lookup:
        match = variant_lookup[normalized]
        source = "dictionary"
        score = 100
    else:
        match, score = fuzzy_match(normalized)
        source = "fuzzy"

    if match:
        detections.append({
            "word": raw_word,
            "normalized": normalized,
            "canonical": match["canonical"],
            "language": match["language"],
            "severity": match["severity"],
            "start": word_entry["start"],
            "end": word_entry["end"],
            "source": source,
            "confidence": round(score / 100, 2),
            "variants": match["variants"]
        })

# --- Run phrase detection ---
detections.extend(check_phrases(transcript))

# --- Sort by timestamp for readability ---
detections.sort(key=lambda d: d["start"])

print(f"Found {len(detections)} detections out of {len(transcript)} words.\n")
for d in detections:
    print(f"  {d['word']!r} -> {d['canonical']} [{d['severity']}] source={d['source']} conf={d['confidence']} at {d['start']}s-{d['end']}s")

with open("detections_output.json", "w", encoding="utf-8") as f:
    json.dump(detections, f, ensure_ascii=False, indent=2)

print(f"\nSaved to detections_output.json")