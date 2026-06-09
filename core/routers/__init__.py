"""Router registry."""

from core.routers.ai_router import router as ai_router
from core.routers.index_router import router as index_router
from core.routers.investigation_router import router as investigation_router

ROUTERS = [
    index_router,
    investigation_router,
    ai_router,
]
