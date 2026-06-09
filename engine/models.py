"""Shared data models for investigation search."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class SearchRequest:
    title: str
    roots: list[Path]
    keywords: list[str]
    output_path: Path
    file_kinds: set[str] = field(default_factory=lambda: {"text", "excel"})
    include_extensions: set[str] | None = None
    exclude_patterns: list[str] = field(default_factory=list)
    case_sensitive: bool = False
    context_lines: int = 1


@dataclass(frozen=True)
class SearchResult:
    investigation_title: str
    keyword: str
    category: str
    file_path: Path
    file_name: str
    extension: str
    sheet_name: str = ""
    cell_address: str = ""
    line_number: int | None = None
    column_number: int | None = None
    encoding: str = ""
    matched_text: str = ""
    before_text: str = ""
    after_text: str = ""
    confirm_status: str = ""
    notes: str = ""


RESULT_HEADERS = [
    "No",
    "InvestigationTitle",
    "Keyword",
    "Category",
    "FilePath",
    "FileName",
    "Extension",
    "SheetName",
    "CellAddress",
    "LineNumber",
    "ColumnNumber",
    "Encoding",
    "MatchedText",
    "BeforeText",
    "AfterText",
    "ConfirmStatus",
    "Notes",
]

