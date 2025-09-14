import os
from loguru import logger

LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "storage", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

LOG_FILE_PATH = os.path.join(LOG_DIR, "app.log")

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
