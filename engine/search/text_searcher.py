"""Text and code keyword search."""

from __future__ import annotations

from pathlib import Path

from engine.models import SearchRequest, SearchResult
from engine.search.encoding import read_text_with_encoding


def search_text_files(files: list[Path], request: SearchRequest) -> list[SearchResult]:
    results: list[SearchResult] = []

    for path in files:
        try:
            text, encoding = read_text_with_encoding(path)
        except OSError as exc:
            results.append(error_result(path, request, str(exc)))
            continue

        lines = text.splitlines()
        for index, line in enumerate(lines):
            for keyword, column in find_keywords(line, request.keywords, request.case_sensitive):
                results.append(
                    SearchResult(
                        investigation_title=request.title,
                        keyword=keyword,
                        category="Text",
                        file_path=path,
                        file_name=path.name,
                        extension=path.suffix.lower(),
                        line_number=index + 1,
                        column_number=column,
                        encoding=encoding,
                        matched_text=line,
                        before_text=context_before(lines, index, request.context_lines),
                        after_text=context_after(lines, index, request.context_lines),
                    )
                )

    return results


def find_keywords(line: str, keywords: list[str], case_sensitive: bool) -> list[tuple[str, int]]:
    haystack = line if case_sensitive else line.casefold()
    matches: list[tuple[str, int]] = []

    for keyword in keywords:
        if not keyword:
            continue
        needle = keyword if case_sensitive else keyword.casefold()
        start = 0
        while True:
            position = haystack.find(needle, start)
            if position == -1:
                break
            matches.append((keyword, position + 1))
            start = position + max(len(needle), 1)

    return matches


def context_before(lines: list[str], index: int, count: int) -> str:
    if count <= 0:
        return ""
    start = max(0, index - count)
    return "\n".join(lines[start:index])


def context_after(lines: list[str], index: int, count: int) -> str:
    if count <= 0:
        return ""
    end = min(len(lines), index + count + 1)
    return "\n".join(lines[index + 1 : end])


def error_result(path: Path, request: SearchRequest, message: str) -> SearchResult:
    return SearchResult(
        investigation_title=request.title,
        keyword="",
        category="Error",
        file_path=path,
        file_name=path.name,
        extension=path.suffix.lower(),
        matched_text=message,
        notes="Text read failed",
    )

