from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import logging

from app.services.embedding_service import embedding_service

log = logging.getLogger(__name__)

router = APIRouter()

@router.post("/{document_id}")
async def generate_embeddings(document_id: str, background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Trigger embedding generation for a document.
    This runs in the background to avoid blocking the request.
    """
    try:
        # Check if already processing
        status = embedding_service.get_embedding_status(document_id)
        if status.get("status") == "processing":
            return {
                "message": "Embedding generation already in progress",
                "status": status
            }

        # Start background task
        background_tasks.add_task(embedding_service.generate_embeddings, document_id)

        return {
            "message": "Embedding generation started",
            "document_id": document_id,
            "status": "started"
        }
    except Exception as e:
        log.exception(f"Error starting embedding generation for document {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start embedding generation: {str(e)}")

@router.get("/status/{document_id}")
async def get_embedding_status(document_id: str) -> Dict[str, Any]:
    """
    Get embedding generation status for a document.
    """
    try:
        status = embedding_service.get_embedding_status(document_id)
        return {
            "document_id": document_id,
            "status": status
        }
    except Exception as e:
        log.exception(f"Error retrieving embedding status for document {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve embedding status: {str(e)}")

@router.delete("/{document_id}")
async def delete_embeddings(document_id: str) -> Dict[str, Any]:
    """
    Delete embeddings for a document.
    """
    try:
        success = embedding_service.delete_embeddings(document_id)
        if success:
            return {
                "message": "Embeddings deleted successfully",
                "document_id": document_id
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to delete embeddings")
    except Exception as e:
        log.exception(f"Error deleting embeddings for document {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete embeddings: {str(e)}")

@router.post("/search/{document_id}")
async def search_similar(document_id: str, query: str, n_results: int = 5) -> Dict[str, Any]:
    """
    Search for similar chunks in a document's embedding space.
    """
    try:
        if not query or not query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        results = embedding_service.search_similar(document_id, query.strip(), n_results)
        return results
    except HTTPException:
        raise
    except Exception as e:
        log.exception(f"Error searching similar chunks for document {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to search similar chunks: {str(e)}")

@router.get("/")
async def get_embeddings_status():
    """Return embeddings service status."""
    return {
        "status": "Embeddings service is operational",
        "model": "all-MiniLM-L6-v2",
        "vector_store": "ChromaDB",
        "storage_path": str(embedding_service.chroma_storage),
    }
