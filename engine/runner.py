"""Command line runner for the investigation engine."""

from __future__ import annotations

import argparse
from pathlib import Path

from engine.models import SearchRequest
from engine.report.excel_writer import write_excel_report
from engine.search.excel_searcher import search_excel_files
from engine.search.file_walker import iter_search_files
from engine.search.text_searcher import search_text_files


def main() -> int:
    args = parse_args()
    request = build_request(args)

    text_files, excel_files = iter_search_files(request)
    results = []

    if "text" in request.file_kinds:
        results.extend(search_text_files(text_files, request))
    if "excel" in request.file_kinds:
        results.extend(search_excel_files(excel_files, request))

    output_path = write_excel_report(request, results)

    print(f"Text files scanned: {len(text_files)}")
    print(f"Excel files scanned: {len(excel_files)}")
    print(f"Results: {len(results)}")
    print(f"Report: {output_path}")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a local impact investigation search.")
    parser.add_argument("--title", required=True, help="Investigation title.")
    parser.add_argument("--root", action="append", required=True, help="Search root. Can be specified multiple times.")
    parser.add_argument("--keyword", action="append", help="Keyword. Can be specified multiple times.")
    parser.add_argument("--keywords", help="Comma-separated keyword list.")
    parser.add_argument("--out", required=True, help="Output .xlsx path.")
    parser.add_argument("--kind", action="append", choices=["text", "excel"], help="Search kind. Defaults to both.")
    parser.add_argument("--case-sensitive", action="store_true", help="Use case-sensitive matching.")
    parser.add_argument("--context-lines", type=int, default=1, help="Text context lines before and after a match.")
    parser.add_argument("--include-extension", action="append", help="Restrict to extensions such as .py or .xlsx.")
    parser.add_argument("--exclude", action="append", default=[], help="Exclude paths containing this text.")
    return parser.parse_args()


def build_request(args: argparse.Namespace) -> SearchRequest:
    keywords: list[str] = []
    if args.keywords:
        keywords.extend(part.strip() for part in args.keywords.split(","))
    if args.keyword:
        keywords.extend(part.strip() for part in args.keyword)
    keywords = [keyword for keyword in keywords if keyword]

    if not keywords:
        raise SystemExit("At least one keyword is required.")

    include_extensions = None
    if args.include_extension:
        include_extensions = {
            extension if extension.startswith(".") else f".{extension}"
            for extension in (item.lower() for item in args.include_extension)
        }

    return SearchRequest(
        title=args.title,
        roots=[Path(root).resolve() for root in args.root],
        keywords=keywords,
        output_path=Path(args.out).resolve(),
        file_kinds=set(args.kind or ["text", "excel"]),
        include_extensions=include_extensions,
        exclude_patterns=args.exclude,
        case_sensitive=args.case_sensitive,
        context_lines=max(0, args.context_lines),
    )


if __name__ == "__main__":
    raise SystemExit(main())

