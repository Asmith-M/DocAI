from fastapi import APIRouter, HTTPException
import logging
import os
import shutil
from pathlib import Path
from app.core.config import settings
from app.services.embedding_service import embedding_service

log = logging.getLogger(__name__)

router = APIRouter()

# Use a dedicated uploads directory under app/storage/uploads
BASE_UPLOAD_DIR = Path(os.getcwd()) / "app" / "storage" / "uploads"


@router.post("/clear")
async def clear_all_documents():
    """Clear all uploaded documents and their associated data."""
    try:
        log.info("Starting bulk document deletion")

        deleted_count = 0
        errors = []

        # Get all document directories
        if BASE_UPLOAD_DIR.exists():
            for doc_dir in BASE_UPLOAD_DIR.iterdir():
                if not doc_dir.is_dir():
                    continue

                document_id = doc_dir.name
                try:
                    # Delete from ChromaDB embeddings
                    embedding_service.delete_embeddings(document_id)

                    # Delete document folder and all contents
                    shutil.rmtree(doc_dir)
                    deleted_count += 1
                    log.info(f"Deleted document {document_id}")

                except Exception as e:
                    error_msg = f"Failed to delete document {document_id}: {str(e)}"
                    log.error(error_msg)
                    errors.append(error_msg)

        log.info(f"Bulk deletion completed. Deleted {deleted_count} documents")

        return {
            "message": f"Successfully deleted {deleted_count} documents",
            "deleted_count": deleted_count,
            "errors": errors
        }

    except Exception as e:
        log.error(f"Error in bulk document deletion: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear documents: {str(e)}")
