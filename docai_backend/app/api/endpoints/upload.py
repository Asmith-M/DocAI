from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
from pathlib import Path

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path(os.getenv("UPLOAD_FOLDER", "./uploads"))
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document for processing
    """
    try:
        # Check file size
        file.file.seek(0, 2)  # Seek to end of file
        file_size = file.file.tell()
        file.file.seek(0)  # Reset file pointer
        
        max_size = int(os.getenv("MAX_FILE_SIZE", 10485760))  # 10MB default
        if file_size > max_size:
            raise HTTPException(status_code=413, detail="File too large")
        
        # Save file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file_size,
            "message": "File uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/status")
async def upload_status():
    """
    Check upload service status
    """
    return {"status": "Upload service is operational"}
