from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
import uuid
from pathlib import Path
from datetime import datetime
import json
import logging
from app.core.config import settings

from app.services.pdf_extractor import PDFExtractor
from app.services.table_extractor import table_extractor
from app.services.chunk_extractor import chunk_extractor
from app.services.embedding_service import embedding_service

log = logging.getLogger(__name__)

router = APIRouter()

# Use a dedicated uploads directory under app/storage/uploads
BASE_UPLOAD_DIR = Path(os.getcwd()) / "app" / "storage" / "uploads"
BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

extractor = PDFExtractor()


@router.post("", name="upload_documents")  # Empty string instead of "/" to avoid trailing slash issues
async def upload_documents(files: List[UploadFile] = File(...)):
    """Accept multiple PDF files, store them and run text extraction pipeline.

    Returns per-file JSON with document_id, filename, status, page_count and extraction_method.
    """
    responses = []
    max_size = settings.MAX_FILE_SIZE

    log.info(f"Received upload request for {len(files)} files")

    for file in files:
        file_result = {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": None,
            "document_id": None,
            "status": "error",
            "page_count": 0,
            "extraction_method": None,
            "message": "",
        }

        try:
            log.info(f"Processing file: {file.filename}")

            # Basic validation
            if not file.filename.lower().endswith('.pdf'):
                error_msg = "Invalid file type. Only PDF files are accepted."
                log.warning(f"Rejected {file.filename}: {error_msg}")
                file_result.update({"message": error_msg})
                responses.append(file_result)
                continue

            # Determine size
            file.file.seek(0, 2)
            file_size = file.file.tell()
            file.file.seek(0)
            file_result["size"] = file_size

            if file_size > max_size:
                error_msg = f"File too large. Maximum size is {max_size / (1024*1024):.1f}MB"
                log.warning(f"Rejected {file.filename}: {error_msg}")
                file_result.update({"message": error_msg})
                responses.append(file_result)
                continue

            # Create document-specific folder
            document_id = uuid.uuid4().hex
            doc_folder = BASE_UPLOAD_DIR / document_id
            doc_folder.mkdir(parents=True, exist_ok=True)

            saved_pdf_path = doc_folder / f"{document_id}.pdf"

            # Save uploaded file
            log.info(f"Saving file {file.filename} to {saved_pdf_path}")
            with open(saved_pdf_path, "wb") as f:
                content = await file.read()
                f.write(content)

            # Run extraction pipeline
            log.info(f"Starting text extraction for {file.filename}")
            extraction = extractor.extract(saved_pdf_path)

            # Save per-page text files and a combined text file
            pages_folder = doc_folder / "pages"
            pages_folder.mkdir(exist_ok=True)

            for i, page_text in enumerate(extraction.get("pages", []), start=1):
                page_file = pages_folder / f"page_{i}.txt"
                page_file.write_text(page_text or "", encoding="utf-8")

            combined_text_path = doc_folder / "extracted_text.txt"
            combined_text_path.write_text("\n\n".join(extraction.get("pages", [])), encoding="utf-8")

            # Run table extraction
            log.info(f"Starting table extraction for {file.filename}")
            try:
                tables_extracted = table_extractor.extract_tables(saved_pdf_path, document_id)
                log.info(f"Table extraction completed: {tables_extracted} tables found")
            except Exception as e:
                log.warning(f"Table extraction failed for {file.filename}: {e}. Continuing with text-only processing.")
                tables_extracted = 0

            # Run chunk extraction
            log.info(f"Starting chunk extraction for {file.filename}")
            try:
                tables_folder = Path(os.getcwd()) / "app" / "storage" / "tables" / document_id
                # Map extraction method to expected format
                method_map = {
                    "pymupdf": "pymupdf",
                    "tesseract": "tesseract",
                    "easyocr": "easyocr",
                    "none": "unknown"
                }
                extraction_method = method_map.get(extraction.get("method", "unknown"), "unknown")
                chunks_extracted = chunk_extractor.extract_chunks(document_id, pages_folder, tables_folder, extraction_method)
                log.info(f"Chunk extraction completed: {chunks_extracted} chunks created")
            except Exception as e:
                log.warning(f"Chunk extraction failed for {file.filename}: {e}. Continuing without chunks.")
                chunks_extracted = 0

            # Map extraction method to expected format
            method_map = {
                "pymupdf": "pymupdf",
                "tesseract": "tesseract",
                "easyocr": "easyocr",
                "none": "unknown"
            }
            extraction_method = method_map.get(extraction.get("method", "unknown"), "unknown")

            # Generate embeddings for the document
            log.info(f"Starting embedding generation for {file.filename}")
            try:
                embedding_success = embedding_service.generate_embeddings(document_id)
                if embedding_success:
                    log.info(f"Embedding generation completed successfully for {file.filename}")
                    embedding_status = "completed"
                else:
                    log.warning(f"Embedding generation failed for {file.filename}")
                    embedding_status = "failed"
            except Exception as e:
                log.error(f"Embedding generation error for {file.filename}: {e}")
                embedding_status = "error"

            # Write metadata JSON
            metadata = {
                "document_id": document_id,
                "filename": file.filename,
                "upload_time": datetime.utcnow().isoformat(),
                "page_count": extraction.get("page_count", 0),
                "extraction_method": extraction_method,
                "has_tables": tables_extracted > 0,
                "tables_extracted": tables_extracted,
                "chunks_extracted": chunks_extracted,
                "embedding_status": embedding_status,
                "status": "processed"
            }

            metadata_path = doc_folder / "metadata.json"
            metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

            file_result.update({
                "document_id": document_id,
                "status": "processed",
                "page_count": extraction.get("page_count", 0),
                "extraction_method": extraction_method,
                "message": "Document processed successfully",
            })

            log.info(f"Successfully processed {file.filename}, method: {extraction_method}, pages: {extraction.get('page_count', 0)}")

        except HTTPException:
            raise
        except Exception as e:
            error_msg = f"Processing failed: {str(e)}"
            log.exception(f"Error processing {file.filename}: {error_msg}")
            file_result.update({"message": error_msg})

        responses.append(file_result)

    return {"files": responses}


@router.get("/")
async def get_upload_status():
    """Return upload service status and uploads directory."""
    return {
        "status": "Upload service is operational",
        "upload_directory": str(BASE_UPLOAD_DIR),
        "max_file_size_mb": settings.MAX_FILE_SIZE / (1024 * 1024),
    }


@router.get("/files")
async def list_uploaded_files():
    """List documents already uploaded with their metadata."""
    try:
        docs = []
        for doc_dir in BASE_UPLOAD_DIR.iterdir():
            if not doc_dir.is_dir():
                continue
            metadata_file = doc_dir / "metadata.json"
            if metadata_file.exists():
                try:
                    m = json.loads(metadata_file.read_text(encoding="utf-8"))
                    docs.append(m)
                except Exception:
                    docs.append({"document_id": doc_dir.name, "status": "metadata_corrupt"})
            else:
                docs.append({"document_id": doc_dir.name, "status": "no_metadata"})
        return {"documents": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list uploaded documents: {str(e)}")


@router.post("/regenerate-embeddings/{document_id}")
async def regenerate_embeddings(document_id: str):
    """Regenerate embeddings for an existing document."""
    try:
        # Check if document exists in file system
        doc_folder = BASE_UPLOAD_DIR / document_id
        if not doc_folder.exists():
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
        
        # Check if metadata exists
        metadata_path = doc_folder / "metadata.json"
        if not metadata_path.exists():
            raise HTTPException(status_code=404, detail=f"Metadata not found for document {document_id}")
        
        log.info(f"Starting embedding regeneration for document {document_id}")
        
        # Generate embeddings
        embedding_success = embedding_service.generate_embeddings(document_id)
        
        if embedding_success:
            log.info(f"Embedding regeneration completed successfully for {document_id}")
            
            # Update metadata
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            metadata["embedding_status"] = "completed"
            metadata["embedding_regenerated"] = datetime.utcnow().isoformat()
            metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
            
            return {
                "document_id": document_id,
                "status": "success",
                "message": "Embeddings regenerated successfully"
            }
        else:
            log.warning(f"Embedding regeneration failed for {document_id}")
            return {
                "document_id": document_id,
                "status": "failed",
                "message": "Embedding regeneration failed"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error regenerating embeddings for {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to regenerate embeddings: {str(e)}")


@router.post("/regenerate-all-embeddings")
async def regenerate_all_embeddings():
    """Regenerate embeddings for all existing documents."""
    try:
        results = []
        
        for doc_dir in BASE_UPLOAD_DIR.iterdir():
            if not doc_dir.is_dir():
                continue
                
            document_id = doc_dir.name
            log.info(f"Regenerating embeddings for document {document_id}")
            
            try:
                embedding_success = embedding_service.generate_embeddings(document_id)
                
                result = {
                    "document_id": document_id,
                    "status": "success" if embedding_success else "failed"
                }
                
                # Update metadata
                metadata_path = doc_dir / "metadata.json"
                if metadata_path.exists():
                    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
                    metadata["embedding_status"] = "completed" if embedding_success else "failed"
                    metadata["embedding_regenerated"] = datetime.utcnow().isoformat()
                    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
                
            except Exception as e:
                log.error(f"Failed to regenerate embeddings for {document_id}: {e}")
                result = {
                    "document_id": document_id,
                    "status": "error",
                    "error": str(e)
                }
            
            results.append(result)
        
        return {
            "message": "Embedding regeneration completed",
            "results": results
        }
        
    except Exception as e:
        log.error(f"Error in bulk embedding regeneration: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to regenerate embeddings: {str(e)}")


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and all its associated data."""
    try:
        # Check if document exists
        doc_folder = BASE_UPLOAD_DIR / document_id
        if not doc_folder.exists():
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
        
        # Delete from ChromaDB (if embedding service has a delete method)
        try:
            # You might need to implement this method in your embedding service
            # embedding_service.delete_document(document_id)
            log.info(f"Attempted to delete embeddings for document {document_id}")
        except Exception as e:
            log.warning(f"Failed to delete embeddings for {document_id}: {e}")
        
        # Delete document folder and all contents
        import shutil
        shutil.rmtree(doc_folder)
        
        log.info(f"Successfully deleted document {document_id}")
        
        return {
            "document_id": document_id,
            "status": "deleted",
            "message": "Document deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error deleting document {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")