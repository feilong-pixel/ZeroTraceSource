"""Investigation orchestration shared by CLI and web service."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass

from engine.models import SearchRequest
from engine.report.excel_writer import write_excel_report
from engine.search.excel_searcher import search_excel_files
from engine.search.file_walker import iter_search_files
from engine.search.text_searcher import search_text_files


@dataclass(frozen=True)
class InvestigationRunResult:
    text_files_scanned: int
    excel_files_scanned: int
    total_results: int
    text_results: int
    excel_results: int
    error_results: int
    report_path: str


def run_investigation(request: SearchRequest) -> InvestigationRunResult:
    text_files, excel_files = iter_search_files(request)
    results = []

    if "text" in request.file_kinds:
        results.extend(search_text_files(text_files, request))
    if "excel" in request.file_kinds:
        results.extend(search_excel_files(excel_files, request))

    output_path = write_excel_report(request, results)
    counts = Counter(result.category for result in results)

    return InvestigationRunResult(
        text_files_scanned=len(text_files),
        excel_files_scanned=len(excel_files),
        total_results=len(results),
        text_results=counts.get("Text", 0),
        excel_results=counts.get("Excel", 0),
        error_results=counts.get("Error", 0),
        report_path=str(output_path),
    )
