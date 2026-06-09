"""Workbench condition configuration persistence."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_DIR = BASE_DIR / "config"
CONFIG_FILE = CONFIG_DIR / "investigation-conditions.json"


class InvestigationConditionsConfig(BaseModel):
    title: str = "Sample Impact Investigation"
    roots: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    excludes: list[str] = Field(default_factory=list)
    includeExtensions: str = ""
    caseSensitive: bool = False
    contextLines: int = 1
    outputDir: str = "outputs"
    outputPrefix: str = "impact-investigation"


def read_investigation_conditions() -> InvestigationConditionsConfig:
    if not CONFIG_FILE.exists():
        return InvestigationConditionsConfig()

    with CONFIG_FILE.open("r", encoding="utf-8") as file:
        data: dict[str, Any] = json.load(file)

    return InvestigationConditionsConfig.model_validate(data)


def save_investigation_conditions(
    config: InvestigationConditionsConfig,
) -> InvestigationConditionsConfig:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    normalized = InvestigationConditionsConfig.model_validate(config.model_dump())

    with CONFIG_FILE.open("w", encoding="utf-8") as file:
        json.dump(normalized.model_dump(), file, ensure_ascii=False, indent=2)
        file.write("\n")

    return normalized
