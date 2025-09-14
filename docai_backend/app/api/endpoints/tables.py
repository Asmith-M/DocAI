from fastapi import APIRouter, HTTPException
import logging
from app.services.table_extractor import table_extractor

log = logging.getLogger(__name__)

router = APIRouter()

@router.get("/{document_id}")
async def get_tables(document_id: str):
    """
    Return all table JSONs for a given document_id.
    """
    try:
        tables = table_extractor.get_tables(document_id)
        if not tables:
            log.warning(f"No tables found for document_id {document_id}")
            return {"tables": []}
        return {"tables": tables}
    except Exception as e:
        log.exception(f"Error retrieving tables for document_id {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve tables: {str(e)}")
