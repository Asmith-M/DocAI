from fastapi import APIRouter
from app.api.endpoints import health, upload

api_router = APIRouter()

# Include all API endpoints
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])

# Add more routers here as they are created
# api_router.include_router(users.router, prefix="/users", tags=["users"])
