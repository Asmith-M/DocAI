from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app instance
app = FastAPI(
    title="DocAI Backend API",
    description="Backend API for DocAI - Document AI Processing",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Default Vite port
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", "http://localhost:5173")
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
    return {"message": "Welcome to DocAI Backend API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "DocAI Backend is running"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "True").lower() == "true"
    )
