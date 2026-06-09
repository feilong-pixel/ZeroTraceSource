"""Excel workbook cell search."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from engine.models import SearchRequest, SearchResult


def search_excel_files(files: list[Path], request: SearchRequest) -> list[SearchResult]:
    try:
        import openpyxl
    except ImportError as exc:
        raise RuntimeError("openpyxl is required for Excel search") from exc

    results: list[SearchResult] = []

    for path in files:
        try:
            workbook = openpyxl.load_workbook(path, data_only=False, read_only=True)
        except Exception as exc:  # noqa: BLE001 - workbook formats can fail in many ways.
            results.append(error_result(path, request, str(exc)))
            continue

        try:
            for sheet in workbook.worksheets:
                for row in sheet.iter_rows():
                    for cell in row:
                        value = normalize_cell_value(cell.value)
                        if value == "":
                            continue
                        for keyword in matching_keywords(value, request.keywords, request.case_sensitive):
                            results.append(
                                SearchResult(
                                    investigation_title=request.title,
                                    keyword=keyword,
                                    category="Excel",
                                    file_path=path,
                                    file_name=path.name,
                                    extension=path.suffix.lower(),
                                    sheet_name=sheet.title,
                                    cell_address=cell.coordinate,
                                    matched_text=value,
                                )
                            )
        finally:
            workbook.close()

    return results


def normalize_cell_value(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def matching_keywords(value: str, keywords: list[str], case_sensitive: bool) -> list[str]:
    haystack = value if case_sensitive else value.casefold()
    matches: list[str] = []

    for keyword in keywords:
        if not keyword:
            continue
        needle = keyword if case_sensitive else keyword.casefold()
        if needle in haystack:
            matches.append(keyword)

    return matches


def error_result(path: Path, request: SearchRequest, message: str) -> SearchResult:
    return SearchResult(
        investigation_title=request.title,
        keyword="",
        category="Error",
        file_path=path,
        file_name=path.name,
        extension=path.suffix.lower(),
        matched_text=message,
        notes="Excel read failed",
    )

