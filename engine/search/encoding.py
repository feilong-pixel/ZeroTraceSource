"""Small encoding helper for text search."""

from __future__ import annotations

from pathlib import Path


ENCODING_CANDIDATES = (
    "utf-8-sig",
    "utf-8",
    "cp932",
    "shift_jis",
    "gb18030",
    "latin-1",
)


def read_text_with_encoding(path: Path) -> tuple[str, str]:
    data = path.read_bytes()

    for encoding in ENCODING_CANDIDATES:
        try:
            return data.decode(encoding), normalize_encoding_name(encoding)
        except UnicodeDecodeError:
            continue

    return data.decode("utf-8", errors="replace"), "UTF-8-REPLACE"


def normalize_encoding_name(encoding: str) -> str:
    if encoding == "utf-8-sig":
        return "UTF-8"
    if encoding == "cp932":
        return "CP932"
    if encoding == "shift_jis":
        return "Shift_JIS"
    if encoding == "gb18030":
        return "GB18030"
    if encoding == "latin-1":
        return "Latin-1"
    return encoding.upper()

