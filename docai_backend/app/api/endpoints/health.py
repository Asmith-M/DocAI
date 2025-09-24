from fastapi import APIRouter

router = APIRouter()

@router.get("", name="health_check")  # Empty string instead of "/" to avoid trailing slash issues
async def health_check():
    return {
        "status": "success",
        "message": "DocAI Backend API is running",
        "data": {
            "service": "DocAI Backend",
            "status": "healthy",
            "version": "1.0.0"
        }
    }

@router.get("/ping")
async def ping():
    return {
        "status": "success",
        "message": "OK",
        "data": {}
    }
