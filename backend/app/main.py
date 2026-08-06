import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    description="FastAPI service for FingerFlow AI - Air Canvas Platform"
)

# CORS middleware configuration for production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Root Endpoint providing API status summary."""
    return {
        "message": "Welcome to FingerFlow AI API",
        "status": "online",
        "documentation": "/docs",
        "openapi": "/openapi.json",
        "health_check": f"{settings.API_V1_STR}/health"
    }


@app.get("/health")
async def root_health():
    """Root Health Check endpoint for Render / Cloud load balancers."""
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@app.get(f"{settings.API_V1_STR}/openapi.json", include_in_schema=False)
async def get_openapi_v1_alias():
    """Alias route for openapi.json under API prefix."""
    return app.openapi()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", settings.PORT))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
