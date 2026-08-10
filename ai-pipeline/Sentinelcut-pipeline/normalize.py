import re

LEET_MAP = {'@': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o', '$': 's', '+': 't'}

def collapse_repeats(word: str) -> str:
    """Collapses 3+ repeated characters into 1. e.g. 'fuuuuck' -> 'fuck'"""
    return re.sub(r'(.)\1{2,}', r'\1', word)

def delete_leet(word: str) -> str:
    """Replaces leetspeak symbols with their letter equivalents. e.g. 'sh1t' -> 'shit'"""
    return ''.join(LEET_MAP.get(ch, ch) for ch in word)

def strip_separators(word: str) -> str:
    """Removes non-alphanumeric characters (including underscore) between letters. e.g. 'f.u.c.k' -> 'fuck'"""
    return re.sub(r'[^a-zA-Z0-9\u0900-\u097F]', '', word)

def normalize_word(word: str) -> str:
    word = word.lower().strip()
    word = delete_leet(word)       # convert symbols to letters FIRST
    word = strip_separators(word)  # THEN remove remaining separators
    word = collapse_repeats(word)
    return word

if __name__ == "__main__":
    test_words = ["fuuuuck", "f.u.c.k", "f_u_c_k", "sh1t", "@sshole", "b!tch", "bcccc", "HELLO"]
    for w in test_words:
        print(f"{w!r} -> {normalize_word(w)!r}")