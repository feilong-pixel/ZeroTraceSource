"""Investigation API routes."""

from fastapi import APIRouter

from core.services.investigation_service import (
    InvestigationRunRequest,
    InvestigationRunResponse,
    run_investigation_from_request,
)

router = APIRouter(prefix="/api/investigations")


@router.post("/run")
def run_investigation(request: InvestigationRunRequest) -> InvestigationRunResponse:
    return run_investigation_from_request(request)

