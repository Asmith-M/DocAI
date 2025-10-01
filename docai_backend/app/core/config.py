import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Server settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./docai.db")

    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

    # Frontend settings
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    # Upload settings
    UPLOAD_FOLDER: str = os.getenv("UPLOAD_FOLDER", "./uploaded_docs")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", 10485760))  # 10MB default

    # AI settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Ollama settings
    OLLAMA_HOST: str = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "gemma:2b-instruct-q4_0")
    OLLAMA_MODEL_FALLBACK: str = os.getenv("OLLAMA_MODEL_FALLBACK", "phi-2")
    OLLAMA_CTX: int = int(os.getenv("OLLAMA_CTX", 4096))
    OLLAMA_NUM_PREDICT: int = int(os.getenv("OLLAMA_NUM_PREDICT", 200))

    # Recommended model configurations
    # Low-spec hardware (4GB RAM, 2-4 cores)
    OLLAMA_MODEL_LOW_SPEC: str = os.getenv("OLLAMA_MODEL_LOW_SPEC", "gemma:2b")
    # Production hardware (8GB+ RAM, 4+ cores)
    OLLAMA_MODEL_PRODUCTION: str = os.getenv("OLLAMA_MODEL_PRODUCTION", "mistral:7b-instruct-q4_0")

    # Memory and performance settings
    OLLAMA_MAX_LOADED_MODELS: int = int(os.getenv("OLLAMA_MAX_LOADED_MODELS", "1"))
    OLLAMA_MAX_QUEUE: int = int(os.getenv("OLLAMA_MAX_QUEUE", "10"))
    OLLAMA_KEEP_ALIVE: str = os.getenv("OLLAMA_KEEP_ALIVE", "5m")

    # Offline mode settings
    OFFLINE_MODE: bool = os.getenv("OFFLINE_MODE", "true").lower() == "true"
    ENABLE_TELEMETRY: bool = os.getenv("ENABLE_TELEMETRY", "false").lower() == "true"

    # Embedding model settings
    EMBEDDING_MODEL_PATH: str = os.getenv("EMBEDDING_MODEL_PATH", "")
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")

    # Multilingual embedding model settings
    MULTILINGUAL_EMBEDDING_MODEL_PATH: str = os.getenv("MULTILINGUAL_EMBEDDING_MODEL_PATH", "")
    MULTILINGUAL_EMBEDDING_MODEL_NAME: str = os.getenv("MULTILINGUAL_EMBEDDING_MODEL_NAME", "paraphrase-multilingual-mpnet-base-v2")

    # Multilingual settings
    SUPPORTED_LANGUAGES: str = os.getenv("SUPPORTED_LANGUAGES", "en,hi,mr")
    ENABLE_TRANSLATION: bool = os.getenv("ENABLE_TRANSLATION", "true").lower() == "true"
    LANG_DETECT_METHOD: str = os.getenv("LANG_DETECT_METHOD", "langdetect")
    HF_MULTILINGUAL_CACHE: str = os.getenv("HF_MULTILINGUAL_CACHE", "./app/storage/hf_multilingual_cache")

    # Translation models (Helsinki-NLP opus-mt)
    TRANSLATION_MODELS: dict = {
        "hi-en": os.getenv("HI_EN_MODEL", "Helsinki-NLP/opus-mt-hi-en"),
        "en-hi": os.getenv("EN_HI_MODEL", "Helsinki-NLP/opus-mt-en-hi"),
        "mr-en": os.getenv("MR_EN_MODEL", "Helsinki-NLP/opus-mt-mr-en"),
        "en-mr": os.getenv("EN_MR_MODEL", "Helsinki-NLP/opus-mt-en-mr"),
    }

    # Chroma settings
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./app/storage/chroma")

    # OCR settings
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "tesseract")
    TESSDATA_PREFIX: str = os.getenv("TESSDATA_PREFIX", "")

    # Hugging Face settings
    HF_HOME: str = os.getenv("HF_HOME", r"C:\hf_offline_cache")
    TRANSFORMERS_OFFLINE: str = os.getenv("TRANSFORMERS_OFFLINE", "1")
    HF_DATASETS_OFFLINE: str = os.getenv("HF_DATASETS_OFFLINE", "1")

    # Model memory footprints (approximate)
    MODEL_MEMORY_FOOTPRINTS = {
        "gemma:2b": "2GB",
        "gemma:7b": "6GB",
        "mistral:7b": "8GB",
        "mistral:7b-instruct-q4_0": "4GB",
        "mistral:7b-instruct-q5_0": "5GB",
        "llama2:7b": "8GB",
        "llama2:7b-chat-q4_0": "4GB",
        "codellama:7b": "8GB",
        "codellama:7b-instruct-q4_0": "4GB"
    }

    # Hardware recommendations
    HARDWARE_RECOMMENDATIONS = {
        "minimum": {
            "ram": "4GB",
            "storage": "50GB",
            "description": "Basic functionality with Gemma 2B, limited concurrent users"
        },
        "recommended": {
            "ram": "8GB",
            "storage": "100GB",
            "description": "Good performance with quantized models, moderate concurrent users"
        },
        "production": {
            "ram": "16GB+",
            "storage": "200GB+",
            "description": "Full performance with larger models, high concurrent users"
        }
    }

settings = Settings()