from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.core.config import settings
from app.utils.logger import logger
from app.llm.ollama_client import get_ollama_client
import os
# Create FastAPI app instance
app = FastAPI(
    title="DocAI Backend API",
    description="Backend API for DocAI - Document AI Processing",
    version="1.0.0"
)

# Configure CORS
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",  # Default Vite port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=None,
)

# Include API routes
from app.api.routes import api_router
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {
        "status": "success",
        "message": "Welcome to DocAI Backend API",
        "data": {
            "service": "DocAI Backend",
            "version": "1.0.0"
        }
    }

@app.on_event("startup")
async def startup_event():
    logger.info("DocAI Backend API starting up")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Host: {settings.HOST}")
    logger.info(f"Port: {settings.PORT}")

    # Set offline environment variables to prevent external calls
    if settings.OFFLINE_MODE or not settings.ENABLE_TELEMETRY:
        os.environ["HF_HOME"] = settings.HF_HOME
        os.environ["TRANSFORMERS_OFFLINE"] = settings.TRANSFORMERS_OFFLINE
        os.environ["HF_DATASETS_OFFLINE"] = settings.HF_DATASETS_OFFLINE
        os.environ["HF_HUB_OFFLINE"] = "1"  # Additional offline flag
        logger.info("Offline mode enabled - external calls disabled")
        logger.info(f"HF_HOME set to: {settings.HF_HOME}")
        logger.info(f"TRANSFORMERS_OFFLINE: {settings.TRANSFORMERS_OFFLINE}")
        logger.info(f"HF_DATASETS_OFFLINE: {settings.HF_DATASETS_OFFLINE}")
    else:
        logger.info("Online mode - telemetry and external calls enabled")

    # Check Ollama model availability
    if not settings.OFFLINE_MODE:
        logger.info("Checking Ollama service and model availability...")
        try:
            ollama_client = get_ollama_client()
            health_status = ollama_client.health_check()

            if health_status.get("healthy"):
                if health_status.get("model_loaded"):
                    logger.info(f"✓ Ollama model '{settings.OLLAMA_MODEL}' is loaded and ready")
                else:
                    logger.warning(f"⚠ Ollama service is running but model '{settings.OLLAMA_MODEL}' is not loaded")
                    logger.warning(f"Available models: {health_status.get('available_models', [])}")
                    logger.warning("Please load the model using: ollama pull {settings.OLLAMA_MODEL}")
            else:
                logger.error(f"✗ Ollama health check failed: {health_status.get('error')}")
                if not settings.OFFLINE_MODE:
                    logger.warning("Consider setting OFFLINE_MODE=true if running in offline environment")
        except Exception as e:
            logger.error(f"Failed to check Ollama status: {e}")
            if not settings.OFFLINE_MODE:
                logger.warning("Consider setting OFFLINE_MODE=true if running in offline environment")
    else:
        logger.info("Running in offline mode - skipping Ollama health check")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("DocAI Backend API shutting down")

if __name__ == "__main__":
    logger.info(f"Starting DocAI Backend API on {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
