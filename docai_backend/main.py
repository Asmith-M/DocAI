from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.core.config import settings
from app.utils.logger import logger

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
