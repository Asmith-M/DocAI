from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.llm.ollama_client import get_ollama_client
from app.services.embedding_service import embedding_service
from app.storage.backup_chroma import chroma_backup_manager
from app.services.pdf_extractor import PDFExtractor

router = APIRouter(tags=["admin_readiness"])

@router.get("/readiness")
async def system_readiness():
    """
    Returns overall system readiness for offline operation.
    Returns True if all critical components are ready for offline use.
    """
    ollama_client = get_ollama_client()
    ollama_ready = False
    if ollama_client:
        health = ollama_client.health_check()
        ollama_ready = health.get("healthy", False) and health.get("model_loaded", False)

    embedding_ready = embedding_service.model is not None

    chroma_ready = chroma_backup_manager.chroma_dir.exists()

    pdf_extractor = PDFExtractor()
    ocr_ready = (pdf_extractor.HAS_FITZ if hasattr(pdf_extractor, "HAS_FITZ") else True) or \
                (pdf_extractor.HAS_PYTESSERACT if hasattr(pdf_extractor, "HAS_PYTESSERACT") else True) or \
                (pdf_extractor.HAS_EASYOCR if hasattr(pdf_extractor, "HAS_EASYOCR") else True)

    overall_ready = ollama_ready and embedding_ready and chroma_ready and ocr_ready

    return JSONResponse(content={
        "ready": overall_ready,
        "components": {
            "ollama": ollama_ready,
            "embedding_service": embedding_ready,
            "chroma_persistence": chroma_ready,
            "ocr_engines": ocr_ready
        },
        "message": "System ready for offline operation" if overall_ready else "System not fully ready for offline operation"
    })
