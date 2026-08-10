import os
import json
from faster_whisper import WhisperModel
from rapidfuzz import fuzz
from normalize import normalize_word

FUZZY_THRESHOLD = 88
MIN_WORD_LENGTH = 4
SAFE_WORDS = {"मर्द"}

# Cache the model so it doesn't reload from disk on every single call —
# important once this runs inside a real backend handling many videos.
_model_cache = {}


def _get_model(model_size="small"):
    if model_size not in _model_cache:
        _model_cache[model_size] = WhisperModel(model_size, device="cpu", compute_type="int8")
    return _model_cache[model_size]


def _load_dictionaries():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, "profanity_dict.json"), "r", encoding="utf-8") as f:
        profanity_dict = json.load(f)
    with open(os.path.join(base_dir, "phrase_dict.json"), "r", encoding="utf-8") as f:
        phrase_dict = json.load(f)
    return profanity_dict, phrase_dict


def _build_lookups(profanity_dict, phrase_dict, custom_words=None):
    variant_lookup = {}
    for canonical, entry in profanity_dict.items():
        for variant in entry["variants"]:
            variant_lookup[normalize_word(variant)] = entry

    if custom_words:
        for word in custom_words:
            entry = {
                "canonical": word,
                "language": "custom",
                "severity": "medium",
                "variants": [word]
            }
            variant_lookup[normalize_word(word)] = entry

    phrase_variant_lookup = {}
    for canonical, entry in phrase_dict.items():
        for variant in entry["variants"]:
            cleaned = " ".join(normalize_word(w) for w in variant.split())
            phrase_variant_lookup[cleaned] = entry

    return variant_lookup, phrase_variant_lookup


def _fuzzy_match(word, variant_lookup):
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


def _check_phrases(words_list, phrase_variant_lookup):
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


def process_video(file_path, custom_words=None, model_size="small",
                   language=None, vad_filter=False):
    """
    Runs the full SentinelCut detection pipeline on one audio/video file.

    Args:
        file_path: path to the audio/video file (any format ffmpeg supports)
        custom_words: optional list of user-added words to merge into detection
        model_size: whisper model size ("small" is fast/good for English,
                    "medium" recommended for Hindi/Hinglish accuracy)
        language: force a language code (e.g. "hi", "en"), or None to auto-detect
        vad_filter: skips silent sections if True — can drop real dialogue on
                    loud/dramatic audio, so defaults to False for safety

    Returns:
        List of detection dicts matching the locked schema:
        word, normalized, canonical, language, severity, start, end,
        source, confidence, variants

    Raises:
        FileNotFoundError: if file_path doesn't exist
        RuntimeError: if transcription fails for any other reason
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    try:
        model = _get_model(model_size)
        segments, info = model.transcribe(
            file_path,
            beam_size=5,
            word_timestamps=True,
            task="transcribe",
            language=language,
            vad_filter=vad_filter,
            condition_on_previous_text=False
        )

        transcript = []
        for segment in segments:
            for word in segment.words:
                transcript.append({
                    "word": word.word.strip(),
                    "start": round(word.start, 2),
                    "end": round(word.end, 2),
                    "confidence": round(word.probability, 2)
                })
    except Exception as e:
        raise RuntimeError(f"Transcription failed for {file_path}: {e}")

    profanity_dict, phrase_dict = _load_dictionaries()
    variant_lookup, phrase_variant_lookup = _build_lookups(profanity_dict, phrase_dict, custom_words)

    detections = []
    for word_entry in transcript:
        raw_word = word_entry["word"].strip()
        if not raw_word:
            continue
        normalized = normalize_word(raw_word)

        if normalized in variant_lookup:
            match = variant_lookup[normalized]
            source = "dictionary"
            score = 100
        else:
            match, score = _fuzzy_match(normalized, variant_lookup)
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

    detections.extend(_check_phrases(transcript, phrase_variant_lookup))
    detections.sort(key=lambda d: d["start"])

    return detections


if __name__ == "__main__":
    # Example usage — swap in any file path to test manually
    import sys
    test_file = sys.argv[1] if len(sys.argv) > 1 else "eng_2.mp4"
    results = process_video(test_file, model_size="small", language="en")
    print(f"Found {len(results)} detections in {test_file}\n")
    for d in results:
        print(f"  {d['word']!r} -> {d['canonical']} [{d['severity']}] source={d['source']} at {d['start']}s-{d['end']}s")