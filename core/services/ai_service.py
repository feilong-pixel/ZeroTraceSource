"""AI assistance for keyword candidate generation."""

from __future__ import annotations

import json
import os
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from pydantic import BaseModel, Field

DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434"
DEFAULT_OLLAMA_MODEL = "qwen3:8b"
OLLAMA_TIMEOUT_SECONDS = 60


class KeywordCandidateRequest(BaseModel):
    changeText: str = ""
    existingKeywords: list[str] = Field(default_factory=list)


class KeywordCandidateResponse(BaseModel):
    ok: bool = True
    candidates: list[str]


def suggest_keyword_candidates(request: KeywordCandidateRequest) -> KeywordCandidateResponse:
    candidates = suggest_with_ollama(request)
    if candidates:
        return KeywordCandidateResponse(candidates=candidates)

    return KeywordCandidateResponse(candidates=suggest_with_rules(request))


def suggest_with_rules(request: KeywordCandidateRequest) -> list[str]:
    existing = {keyword.casefold() for keyword in request.existingKeywords}
    candidates: list[str] = []

    for token in extract_tokens(request.changeText):
        add_candidate(candidates, existing, token)

    for token in list(candidates):
        if is_identifier_like(token):
            add_candidate(candidates, existing, to_snake_case(token))
            add_candidate(candidates, existing, to_camel_case(token))

    return candidates[:24]


def suggest_with_ollama(request: KeywordCandidateRequest) -> list[str]:
    if os.getenv("ZT_AI_PROVIDER", "ollama").lower() != "ollama":
        return []
    if not request.changeText.strip():
        return []

    payload = {
        "model": os.getenv("ZT_OLLAMA_MODEL", DEFAULT_OLLAMA_MODEL),
        "think": False,
        "stream": False,
        "messages": [
            {
                "role": "system",
                "content": build_system_prompt(),
            },
            {
                "role": "user",
                "content": build_user_prompt(request),
            },
        ],
        "options": {
            "temperature": 0.1,
        },
    }

    endpoint = os.getenv("ZT_OLLAMA_URL", DEFAULT_OLLAMA_URL).rstrip("/") + "/api/chat"
    http_request = Request(
        endpoint,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(http_request, timeout=OLLAMA_TIMEOUT_SECONDS) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, OSError, json.JSONDecodeError):
        return []

    content = data.get("message", {}).get("content", "")
    return parse_model_candidates(content, request.existingKeywords)


def build_system_prompt() -> str:
    return (
        "You are a local change impact investigation assistant. "
        "Generate keyword candidates for searching source code and Excel specification documents. "
        "Return only a JSON array of strings. Do not explain. "
        "Include Japanese business terms, possible English variable names, and possible snake_case database field names. "
        "Do not judge impact scope. Do not output conclusions. Limit to 20 items."
    )


def build_user_prompt(request: KeywordCandidateRequest) -> str:
    return (
        "/no_think\n"
        "Customer change description:\n"
        f"{request.changeText.strip()}\n\n"
        "Already confirmed keywords:\n"
        f"{json.dumps(request.existingKeywords, ensure_ascii=False)}\n\n"
        "Return only JSON array, for example:\n"
        '["安全方針", "safetyStrategy", "safety_strategy"]'
    )


def parse_model_candidates(content: str, existing_keywords: list[str]) -> list[str]:
    cleaned = strip_think_blocks(content).strip()
    match = re.search(r"\[[\s\S]*\]", cleaned)
    if not match:
        return []

    try:
        raw_values = json.loads(match.group(0))
    except json.JSONDecodeError:
        return []

    if not isinstance(raw_values, list):
        return []

    existing = {keyword.casefold() for keyword in existing_keywords}
    candidates: list[str] = []
    for value in raw_values:
        if isinstance(value, str):
            add_candidate(candidates, existing, value)
    return candidates[:24]


def strip_think_blocks(content: str) -> str:
    return re.sub(r"<think>[\s\S]*?</think>", "", content, flags=re.IGNORECASE)


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
