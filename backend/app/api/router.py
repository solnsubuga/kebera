from fastapi import APIRouter

from app.api.routes import engagements, health

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(engagements.router)
