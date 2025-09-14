from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import logging

from app.services.chunk_extractor import chunk_extractor

log = logging.getLogger(__name__)

router = APIRouter()

@router.get("/{document_id}")
async def get_chunks(document_id: str) -> Dict[str, Any]:
    """
    Return all chunks for a given document_id with metadata.
    """
    try:
        chunks = chunk_extractor.load_chunks(document_id)
        if not chunks:
            return {
                "document_id": document_id,
                "chunks": [],
                "total_chunks": 0,
                "message": "No chunks found for this document"
            }

        return {
            "document_id": document_id,
            "chunks": chunks,
            "total_chunks": len(chunks),
            "message": f"Found {len(chunks)} chunks"
        }
    except Exception as e:
        log.exception(f"Error retrieving chunks for document {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve chunks: {str(e)}")

@router.get("/")
async def get_chunks_status():
    """Return chunks service status."""
    return {
        "status": "Chunks service is operational",
        "storage_path": str(chunk_extractor.chunks_storage),
    }
