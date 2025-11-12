import time
import functools
import inspect
from loguru import logger


def log_time(func):
    """Decorator to log start, end and elapsed time for sync/async functions and async generators.

    Logs go to the configured `logger` (which writes to `app.log`).
    """

    if inspect.iscoroutinefunction(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.perf_counter()
            logger.info(f"{func.__qualname__} started")
            try:
                return await func(*args, **kwargs)
            finally:
                elapsed = time.perf_counter() - start
                logger.info(f"{func.__qualname__} completed in {elapsed:.3f}s")

        return async_wrapper

    if inspect.isasyncgenfunction(func):
        @functools.wraps(func)
        async def asyncgen_wrapper(*args, **kwargs):
            start = time.perf_counter()
            logger.info(f"{func.__qualname__} started")
            try:
                async for item in func(*args, **kwargs):
                    yield item
            finally:
                elapsed = time.perf_counter() - start
                logger.info(f"{func.__qualname__} completed in {elapsed:.3f}s")

        return asyncgen_wrapper

    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        start = time.perf_counter()
        logger.info(f"{func.__qualname__} started")
        try:
            return func(*args, **kwargs)
        finally:
            elapsed = time.perf_counter() - start
            logger.info(f"{func.__qualname__} completed in {elapsed:.3f}s")

    return sync_wrapper
