from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from app.storage.backup_chroma import chroma_backup_manager

router = APIRouter(prefix="/api/admin/chroma", tags=["admin_chroma"])

@router.post("/backup")
async def create_backup(backup_name: str = None):
    """
    Create a backup of the ChromaDB persistence directory.
    Optional backup_name can be provided.
    """
    result = chroma_backup_manager.create_backup(backup_name)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error"))
    return JSONResponse(content=result)

@router.get("/backups")
async def list_backups():
    """
    List all available ChromaDB backups.
    """
    result = chroma_backup_manager.list_backups()
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error"))
    return JSONResponse(content=result)

@router.post("/restore")
async def restore_backup(backup_name: str):
    """
    Restore ChromaDB from a specified backup.
    """
    result = chroma_backup_manager.restore_backup(backup_name)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error"))
    return JSONResponse(content=result)

@router.delete("/backup")
async def delete_backup(backup_name: str):
    """
    Delete a specified ChromaDB backup.
    """
    result = chroma_backup_manager.delete_backup(backup_name)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error"))
    return JSONResponse(content=result)

@router.post("/cleanup")
async def cleanup_old_backups(keep_count: int = 10):
    """
    Cleanup old backups, keeping only the most recent 'keep_count' backups.
    """
    result = chroma_backup_manager.cleanup_old_backups(keep_count)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error"))
    return JSONResponse(content=result)
