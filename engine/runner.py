"""Command line runner for the investigation engine."""

from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path

from engine.investigation import run_investigation
from engine.models import SearchRequest


def main() -> int:
    args = parse_args()
    request = build_request(args)
    result = run_investigation(request)

    print(f"Text files scanned: {result.text_files_scanned}")
    print(f"Excel files scanned: {result.excel_files_scanned}")
    print(f"Results: {result.total_results}")
    print(f"Report: {result.report_path}")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a local impact investigation search.")
    parser.add_argument("--title", required=True, help="Investigation title.")
    parser.add_argument("--root", action="append", required=True, help="Search root. Can be specified multiple times.")
    parser.add_argument("--keyword", action="append", help="Keyword. Can be specified multiple times.")
    parser.add_argument("--keywords", help="Comma-separated keyword list.")
    parser.add_argument("--out", help="Output .xlsx path. Kept for compatibility.")
    parser.add_argument("--out-dir", help="Output directory. Used with --prefix.")
    parser.add_argument("--prefix", help="Output file prefix. Used with --out-dir.")
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
        output_path=build_output_path(args),
        file_kinds=set(args.kind or ["text", "excel"]),
        include_extensions=include_extensions,
        exclude_patterns=args.exclude,
        case_sensitive=args.case_sensitive,
        context_lines=max(0, args.context_lines),
    )


def build_output_path(args: argparse.Namespace) -> Path:
    if args.out:
        return Path(args.out).resolve()

    if not args.out_dir or not args.prefix:
        raise SystemExit("Either --out or both --out-dir and --prefix are required.")

    safe_prefix = sanitize_prefix(args.prefix)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return (Path(args.out_dir) / f"{safe_prefix}_{timestamp}.xlsx").resolve()


def sanitize_prefix(value: str) -> str:
    cleaned = "".join("_" if char in '<>:"/\\|?*' else char for char in value.strip())
    return cleaned or "investigation"


if __name__ == "__main__":
    raise SystemExit(main())
