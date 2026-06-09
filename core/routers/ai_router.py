"""AI assistance routes."""

from fastapi import APIRouter

from core.services.ai_service import KeywordCandidateRequest, KeywordCandidateResponse, suggest_keyword_candidates

router = APIRouter(prefix="/api/ai")


@router.post("/keyword-candidates")
def keyword_candidates(request: KeywordCandidateRequest) -> KeywordCandidateResponse:
    return suggest_keyword_candidates(request)

