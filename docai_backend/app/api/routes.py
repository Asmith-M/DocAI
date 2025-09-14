from fastapi import APIRouter
from app.api.endpoints import health, upload, tables, chunks, embeddings, rag

api_router = APIRouter()

# Include all API endpoints
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(tables.router, prefix="/tables", tags=["tables"])
api_router.include_router(chunks.router, prefix="/chunks", tags=["chunks"])
api_router.include_router(embeddings.router, prefix="/embed", tags=["embeddings"])
api_router.include_router(rag.router, prefix="/rag", tags=["rag"])

# Add more routers here as they are created
# api_router.include_router(users.router, prefix="/users", tags=["users"])
