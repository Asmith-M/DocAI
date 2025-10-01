import os
import json
from datetime import datetime
from loguru import logger

LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "storage", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

LOG_FILE_PATH = os.path.join(LOG_DIR, "app.log")
STRUCTURED_LOG_FILE_PATH = os.path.join(LOG_DIR, "structured_language_logs.jsonl")

logger.remove()
logger.add(
    LOG_FILE_PATH,
    rotation="10 MB",
    retention="10 days",
    compression="zip",
    enqueue=True,
    backtrace=True,
    diagnose=True,
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
)

# Add structured logging handler for language-related logs
logger.add(
    STRUCTURED_LOG_FILE_PATH,
    rotation="10 MB",
    retention="30 days",
    compression="zip",
    enqueue=True,
    level="INFO",
    format="{message}",  # Raw JSON message
    filter=lambda record: record["extra"].get("structured", False)
)

def log_structured(stage: str, request_id: str, data: dict):
    """
    Log structured information for language processing stages.

    Args:
        stage: The processing stage (e.g., 'QueryReceived', 'LanguageDetection', 'RAGContext', 'FinalPrompt', 'LLMResponse')
        request_id: Unique identifier for the request
        data: Dictionary containing relevant data for the stage
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "requestId": request_id,
        "stage": stage,
        "data": data
    }

    # Log as JSON to structured log file
    logger.bind(structured=True).info(json.dumps(log_entry, ensure_ascii=False))
