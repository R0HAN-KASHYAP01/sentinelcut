import csv
import json

phrase_dict = {}

with open("extra_words.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) < 2:
            continue
        romanized, devanagari = row[0].strip(), row[1].strip()
        if not romanized or not devanagari:
            continue

        canonical = devanagari
        phrase_dict[canonical] = {
            "canonical": canonical,
            "language": "hinglish",
            "severity": "medium",
            "variants": [devanagari, romanized]
        }

with open("phrase_dict.json", "w", encoding="utf-8") as f:
    json.dump(phrase_dict, f, ensure_ascii=False, indent=2)

print(f"Converted {len(phrase_dict)} phrases into phrase_dict.json")