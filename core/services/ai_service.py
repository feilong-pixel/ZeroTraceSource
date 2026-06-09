"""Rule-based AI assistance placeholder."""

from __future__ import annotations

import re

from pydantic import BaseModel, Field


class KeywordCandidateRequest(BaseModel):
    changeText: str = ""
    existingKeywords: list[str] = Field(default_factory=list)


class KeywordCandidateResponse(BaseModel):
    ok: bool = True
    candidates: list[str]


def suggest_keyword_candidates(request: KeywordCandidateRequest) -> KeywordCandidateResponse:
    existing = {keyword.casefold() for keyword in request.existingKeywords}
    candidates: list[str] = []

    for token in extract_tokens(request.changeText):
        add_candidate(candidates, existing, token)

    for token in list(candidates):
        if is_identifier_like(token):
            add_candidate(candidates, existing, to_snake_case(token))
            add_candidate(candidates, existing, to_camel_case(token))

    return KeywordCandidateResponse(candidates=candidates[:24])


def extract_tokens(text: str) -> list[str]:
    tokens: list[str] = []
    tokens.extend(re.findall(r"[A-Za-z][A-Za-z0-9_]{2,}", text))
    tokens.extend(extract_cjk_terms(text))
    tokens.extend(re.findall(r"[A-Za-z0-9_]*_[A-Za-z0-9_]+", text))
    return tokens


def extract_cjk_terms(text: str) -> list[str]:
    terms: list[str] = []
    chunks = re.split(r"[\s、。,.，．；;:：()（）「」『』\[\]【】]+", text)
    for chunk in chunks:
        if not re.search(r"[\u3040-\u30ff\u3400-\u9fff]", chunk):
            continue
        parts = re.split(r"によって|から|まで|する|した|の|を|に|へ|で|と|が|は|も|し", chunk)
        for part in parts:
            cleaned = part.strip()
            if 2 <= len(cleaned) <= 12:
                terms.append(cleaned)
    return terms


def add_candidate(candidates: list[str], existing: set[str], value: str) -> None:
    value = value.strip()
    if not value:
        return
    folded = value.casefold()
    if folded in existing:
        return
    if any(item.casefold() == folded for item in candidates):
        return
    candidates.append(value)


def is_identifier_like(value: str) -> bool:
    return bool(re.search(r"[A-Za-z_]", value))


def to_snake_case(value: str) -> str:
    text = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", value)
    text = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", text)
    return text.replace("-", "_").lower()


def to_camel_case(value: str) -> str:
    parts = re.split(r"[_\-\s]+", value)
    if not parts:
        return value
    return parts[0].lower() + "".join(part[:1].upper() + part[1:] for part in parts[1:])
