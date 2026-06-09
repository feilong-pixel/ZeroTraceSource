"""Workbench configuration API routes."""

from fastapi import APIRouter

from core.services.workbench_config_service import (
    InvestigationConditionsConfig,
    read_investigation_conditions,
    save_investigation_conditions,
)

router = APIRouter(prefix="/api/workbench")


@router.get("/investigation-conditions")
async def get_investigation_conditions() -> dict[str, object]:
    return {
        "ok": True,
        "conditions": read_investigation_conditions().model_dump(),
    }


@router.post("/investigation-conditions")
async def post_investigation_conditions(
    conditions: InvestigationConditionsConfig,
) -> dict[str, object]:
    saved = save_investigation_conditions(conditions)
    return {
        "ok": True,
        "conditions": saved.model_dump(),
    }
