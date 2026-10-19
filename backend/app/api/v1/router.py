from fastapi import APIRouter
from app.api.v1.endpoints import fairpass, health

api_router = APIRouter()
api_router.include_router(health.router, prefix="/api")
api_router.include_router(fairpass.router, prefix="/api")
