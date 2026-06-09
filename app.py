"""ZeroTraceSource FastAPI application."""

from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from core.routers import ROUTERS

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
NO_CACHE_PATHS = {"/", "/index.html"}
NO_CACHE_SUFFIXES = (".html", ".js", ".css")

app = FastAPI()


class StaticNoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Any) -> Response:
        response = await call_next(request)
        path = request.url.path
        if path in NO_CACHE_PATHS or path.endswith(NO_CACHE_SUFFIXES):
            response.headers["Cache-Control"] = "no-store, max-age=0"
            response.headers["Pragma"] = "no-cache"
        return response


for router in ROUTERS:
    app.include_router(router)

app.add_middleware(StaticNoCacheMiddleware)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

