from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.llm.model_manager import model_manager

router = APIRouter(prefix="/api/admin/model", tags=["admin_model"])

class ModelRequest(BaseModel):
    model_name: str

@router.post("/load")
async def load_model(request: ModelRequest):
    """
    Load a model into Ollama using the model manager.
    """
    result = model_manager.preload_model(request.model_name)

    if result["success"]:
        return JSONResponse(content=result)
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result["error"])

@router.post("/unload")
async def unload_model(request: ModelRequest):
    """
    Unload a model from Ollama using the model manager.
    """
    result = model_manager.unload_model(request.model_name)

    if result["success"]:
        return JSONResponse(content=result)
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])

@router.get("/list")
async def list_models():
    """
    List available models in Ollama.
    """
    models = model_manager.get_available_models()
    return JSONResponse(content={
        "models": models,
        "count": len(models)
    })

@router.get("/status/{model_name}")
async def get_model_status(model_name: str):
    """
    Get status of a specific model.
    """
    status = model_manager.get_model_status(model_name)
    return JSONResponse(content={
        "model": model_name,
        "status": status
    })

@router.get("/memory")
async def get_memory_usage():
    """
    Get memory usage of preloaded models.
    """
    memory_info = model_manager.get_memory_usage()
    return JSONResponse(content=memory_info)

@router.get("/recommendations/{hardware_spec}")
async def get_model_recommendations(hardware_spec: str = "standard"):
    """
    Get recommended models based on hardware specifications.
    """
    recommendations = model_manager.get_recommended_models(hardware_spec)
    return JSONResponse(content={
        "hardware_spec": hardware_spec,
        "recommendations": recommendations
    })
