from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.llm.ollama_client import get_ollama_client
from app.services.embedding_service import embedding_service
from app.storage.backup_chroma import chroma_backup_manager
from app.services.pdf_extractor import PDFExtractor

router = APIRouter(tags=["admin_offline"])

@router.get("/status")
async def offline_status():
    """
    Returns the health status of offline components:
    Ollama service and model, embedding service, chroma persistence, OCR setup.
    """
    ollama_client = get_ollama_client()
    ollama_health = ollama_client.health_check() if ollama_client else {"healthy": False, "error": "Ollama client not initialized"}

    embedding_status = {
        "model_loaded": embedding_service.model is not None,
        "embedding_model_path": getattr(embedding_service.model, "model_name", "unknown")
    }

    chroma_status = {
        "chroma_persist_dir_exists": chroma_backup_manager.chroma_dir.exists(),
        "backup_dir_exists": chroma_backup_manager.backup_dir.exists()
    }

    pdf_extractor = PDFExtractor()
    ocr_status = {
        "pymupdf_available": pdf_extractor.HAS_FITZ if hasattr(pdf_extractor, "HAS_FITZ") else True,
        "tesseract_available": pdf_extractor.HAS_PYTESSERACT if hasattr(pdf_extractor, "HAS_PYTESSERACT") else True,
        "easyocr_available": pdf_extractor.HAS_EASYOCR if hasattr(pdf_extractor, "HAS_EASYOCR") else True,
        "tesseract_cmd": getattr(pdf_extractor, "TESSERACT_CMD", None),
        "tessdata_prefix": getattr(pdf_extractor, "TESSDATA_PREFIX", None)
    }

    return JSONResponse(content={
        "ollama": ollama_health,
        "embedding_service": embedding_status,
        "chroma": chroma_status,
        "ocr": ocr_status
    })
