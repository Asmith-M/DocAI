from fastapi import APIRouter
from app.api.endpoints import health, upload, tables, chunks, embeddings, rag, admin_chroma_backup, admin_offline_status, admin_model_load, admin_readiness

api_router = APIRouter()

# Include all API endpoints
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(tables.router, prefix="/tables", tags=["tables"])
api_router.include_router(chunks.router, prefix="/chunks", tags=["chunks"])
api_router.include_router(embeddings.router, prefix="/embed", tags=["embeddings"])
api_router.include_router(rag.router, prefix="/rag", tags=["rag"])
api_router.include_router(admin_chroma_backup.router, prefix="/admin/chroma", tags=["admin_chroma"])
api_router.include_router(admin_offline_status.router, prefix="/admin/offline", tags=["admin_offline"])
api_router.include_router(admin_model_load.router, prefix="/admin/model", tags=["admin_model"])
api_router.include_router(admin_readiness.router, prefix="/admin", tags=["admin_readiness"])

# Add streaming endpoint directly (not part of rag router)
from app.api.endpoints.rag import rag_stream_post
api_router.add_api_route("/stream/{document_id}", rag_stream_post, methods=["POST"])

# Add more routers here as they are created
# api_router.include_router(users.router, prefix="/users", tags=["users"])
