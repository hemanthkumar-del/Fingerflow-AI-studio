from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.api.ai_router import ai_router

api_router = APIRouter()


class HealthCheckResponse(BaseModel):
    status: str
    app_name: str
    version: str
    services: Dict[str, Any]


@api_router.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Health check endpoint to verify backend service operational state."""
    return HealthCheckResponse(
        status="healthy",
        app_name="FingerFlow AI Backend",
        version="1.0.0",
        services={
            "database": "configured (firestore)",
            "ai_engine": "configured (gemini-1.5-flash)",
            "hand_tracking": "enabled (mediapipe)"
        }
    )


# Include AI router
api_router.include_router(ai_router)
