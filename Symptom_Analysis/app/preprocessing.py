import re


def preprocess_text(text: str) -> str:
    

    if not isinstance(text, str):
        return ""

    text = text.lower().strip()

    # common shorthand / typo / medical replacements
    replacements = {
        "tbh": "to be honest",
        "ngl": "not gonna lie",
        "rn": "right now",
        "w/": "with",
        "@": "at",
        "iop": "intraocular pressure",
        "cant": "cannot",
        "eys": "eyes",
        "vison": "vision",
        "blury": "blurry",
        "arond": "around",
        "bendy": "bent",
        "reed": "read",
        "straigt": "straight",
        "everwhere": "everywhere",
        " n ": " and ",
        " c ": " see "
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # special characters remove
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # extra spaces remove
    text = re.sub(r"\s+", " ", text).strip()

    return text