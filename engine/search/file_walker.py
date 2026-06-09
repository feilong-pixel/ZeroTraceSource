"""File discovery for investigation searches."""

from __future__ import annotations

from pathlib import Path

from engine.config import EXCEL_EXTENSIONS, SKIP_DIR_NAMES, TEXT_EXTENSIONS
from engine.models import SearchRequest


def iter_search_files(request: SearchRequest) -> tuple[list[Path], list[Path]]:
    text_files: list[Path] = []
    excel_files: list[Path] = []

    for root in request.roots:
        if root.is_file():
            add_file(root, request, text_files, excel_files)
            continue

        if not root.exists():
            continue

        for path in root.rglob("*"):
            if path.is_dir():
                continue
            if any(part in SKIP_DIR_NAMES for part in path.parts):
                continue
            add_file(path, request, text_files, excel_files)

    return text_files, excel_files


def add_file(path: Path, request: SearchRequest, text_files: list[Path], excel_files: list[Path]) -> None:
    if should_exclude(path, request.exclude_patterns):
        return

    extension = path.suffix.lower()
    if request.include_extensions and extension not in request.include_extensions:
        return

    if "text" in request.file_kinds and extension in TEXT_EXTENSIONS:
        text_files.append(path)
    elif "excel" in request.file_kinds and extension in EXCEL_EXTENSIONS:
        excel_files.append(path)


def should_exclude(path: Path, patterns: list[str]) -> bool:
    text = str(path)
    return any(pattern and pattern in text for pattern in patterns)

