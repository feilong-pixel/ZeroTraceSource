"""Investigation API service."""

from pathlib import Path
from datetime import datetime

from fastapi import HTTPException
from pydantic import BaseModel, Field, field_validator

from engine.investigation import run_investigation
from engine.models import SearchRequest

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class InvestigationRunRequest(BaseModel):
    title: str
    roots: list[str]
    keywords: list[str]
    outputPath: str | None = None
    outputDir: str | None = None
    outputPrefix: str | None = None
    fileKinds: list[str] = Field(default_factory=lambda: ["text", "excel"])
    excludePatterns: list[str] = Field(default_factory=list)
    includeExtensions: list[str] = Field(default_factory=list)
    caseSensitive: bool = False
    contextLines: int = 1

    @field_validator("title")
    @classmethod
    def require_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("value is required")
        return value

    @field_validator("roots", "keywords", "fileKinds")
    @classmethod
    def require_non_empty_list(cls, values: list[str]) -> list[str]:
        cleaned = [str(value).strip() for value in values if str(value).strip()]
        if not cleaned:
            raise ValueError("at least one value is required")
        return cleaned

    @field_validator("excludePatterns", "includeExtensions")
    @classmethod
    def clean_optional_list(cls, values: list[str]) -> list[str]:
        return [str(value).strip() for value in values if str(value).strip()]


class InvestigationRunResult(BaseModel):
    text_files_scanned: int
    excel_files_scanned: int
    total_results: int
    text_results: int
    excel_results: int
    error_results: int
    report_path: str


class InvestigationRunResponse(BaseModel):
    ok: bool = True
    result: InvestigationRunResult


def run_investigation_from_request(request: InvestigationRunRequest) -> InvestigationRunResponse:
    file_kinds = set(request.fileKinds)
    if not file_kinds.issubset({"text", "excel"}):
        raise HTTPException(status_code=400, detail="fileKinds can only contain text and excel")

    search_request = SearchRequest(
        title=request.title,
        roots=[resolve_user_path(root) for root in request.roots],
        keywords=request.keywords,
        output_path=build_output_path(request),
        file_kinds=file_kinds,
        include_extensions=normalize_extensions(request.includeExtensions),
        exclude_patterns=request.excludePatterns,
        case_sensitive=request.caseSensitive,
        context_lines=max(0, request.contextLines),
    )
    result = run_investigation(search_request)
    return InvestigationRunResponse(result=InvestigationRunResult(**result.__dict__))


def resolve_user_path(value: str) -> Path:
    path = Path(value)
    if not path.is_absolute():
        path = BASE_DIR / path
    return path.resolve()


def build_output_path(request: InvestigationRunRequest) -> Path:
    if request.outputPath and request.outputPath.strip():
        return resolve_user_path(request.outputPath.strip())

    if not request.outputDir or not request.outputPrefix:
        raise HTTPException(status_code=400, detail="outputDir and outputPrefix are required")

    output_dir = resolve_user_path(request.outputDir.strip())
    prefix = sanitize_prefix(request.outputPrefix)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return (output_dir / f"{prefix}_{timestamp}.xlsx").resolve()


def sanitize_prefix(value: str | None) -> str:
    text = (value or "").strip()
    cleaned = "".join("_" if char in '<>:"/\\|?*' else char for char in text)
    return cleaned or "investigation"


def normalize_extensions(values: list[str]) -> set[str] | None:
    normalized = {
        value.lower() if value.startswith(".") else f".{value.lower()}"
        for value in values
        if value.strip()
    }
    return normalized or None
