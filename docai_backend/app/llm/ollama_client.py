import asyncio
import json
import logging
import os
import requests
from typing import Any, AsyncGenerator, Dict, Optional
from pathlib import Path
import platform

log = logging.getLogger(__name__)

try:
    from ollama import Client
    HAS_OLLAMA = True
except ImportError:
    HAS_OLLAMA = False
    log.warning("Ollama package not installed. Install with: pip install ollama")


class OllamaClient:
    """Robust Ollama client wrapper with offline support and health checks."""

    def __init__(self, host: str = "http://localhost:11434", model: str = "gemma:2b", offline_mode: bool = False):
        self.host = host
        self.model = model
        self.offline_mode = offline_mode
        self.client = None

        if HAS_OLLAMA:
            try:
                self.client = Client(host=host)
                log.info(f"OllamaClient initialized with host={host}, model={model}, offline_mode={offline_mode}")
            except Exception as e:
                log.error(f"Failed to initialize Ollama client: {e}")
                if offline_mode:
                    log.warning("Continuing in offline mode despite client initialization failure")
                else:
                    raise
        else:
            if offline_mode:
                log.warning("Ollama package not available, but offline_mode=True - some features may be limited")
            else:
                raise ImportError("Ollama package not installed. Install with: pip install ollama")

    def health_check(self) -> Dict[str, Any]:
        """Check Ollama service health and model availability."""
        try:
            # Check if Ollama service is running
            response = requests.get(f"{self.host}/api/tags", timeout=5)
            if response.status_code != 200:
                return {
                    "healthy": False,
                    "error": f"Ollama service returned status {response.status_code}",
                    "model_loaded": False
                }

            tags_data = response.json()
            available_models = [model['name'] for model in tags_data.get('models', [])]

            model_loaded = self.model in available_models

            if not model_loaded:
                return {
                    "healthy": True,
                    "error": f"Model '{self.model}' not found. Available models: {available_models}",
                    "model_loaded": False,
                    "available_models": available_models
                }

            return {
                "healthy": True,
                "model_loaded": True,
                "model": self.model,
                "available_models": available_models
            }

        except requests.exceptions.RequestException as e:
            return {
                "healthy": False,
                "error": f"Cannot connect to Ollama service at {self.host}: {str(e)}",
                "model_loaded": False
            }
        except Exception as e:
            return {
                "healthy": False,
                "error": f"Health check failed: {str(e)}",
                "model_loaded": False
            }

    def generate_sync(self, prompt: str, **kwargs) -> str:
        """Generate text synchronously."""
        if not self.client:
            raise RuntimeError("Ollama client not initialized")

        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                **kwargs
            )
            return response.get('response', '')
        except Exception as e:
            log.error(f"Sync generation failed: {e}")
            raise

    async def generate_async(self, prompt: str, **kwargs) -> str:
        """Generate text asynchronously."""
        if not self.client:
            raise RuntimeError("Ollama client not initialized")

        loop = asyncio.get_event_loop()
        try:
            response = await loop.run_in_executor(
                None,
                lambda: self.client.generate(
                    model=self.model,
                    prompt=prompt,
                    **kwargs
                )
            )
            return response.get('response', '')
        except Exception as e:
            log.error(f"Async generation failed: {e}")
            raise

    def generate_stream(self, prompt: str, **kwargs) -> Any:
        """Generate text with streaming (synchronous iterator)."""
        if not self.client:
            raise RuntimeError("Ollama client not initialized")

        try:
            return self.client.generate(
                model=self.model,
                prompt=prompt,
                stream=True,
                **kwargs
            )
        except Exception as e:
            log.error(f"Stream generation failed: {e}")
            raise

    async def generate_stream_async(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        """Generate text with async streaming."""
        if not self.client:
            raise RuntimeError("Ollama client not initialized")

        loop = asyncio.get_event_loop()
        try:
            def sync_generator():
                stream = self.client.generate(
                    model=self.model,
                    prompt=prompt,
                    stream=True,
                    **kwargs
                )
                for chunk in stream:
                    yield chunk.get('response', '')

            gen = sync_generator()
            while True:
                chunk = await loop.run_in_executor(None, lambda: next(gen, None))
                if chunk is None:
                    break
                yield chunk

        except Exception as e:
            log.error(f"Async stream generation failed: {e}")
            raise

    def list_models(self) -> list:
        """List available models."""
        if not self.client:
            return []

        try:
            response = self.client.list()
            return [model['name'] for model in response.get('models', [])]
        except Exception as e:
            log.error(f"Failed to list models: {e}")
            return []

    def pull_model(self, model_name: str) -> bool:
        """Pull a model (only works if not in offline mode)."""
        if self.offline_mode:
            log.warning("Cannot pull model in offline mode")
            return False

        if not self.client:
            return False

        try:
            self.client.pull(model_name)
            log.info(f"Successfully pulled model: {model_name}")
            return True
        except Exception as e:
            log.error(f"Failed to pull model {model_name}: {e}")
            return False

    def check_model_exists(self, model_name: str) -> bool:
        """Check if a model exists locally."""
        available_models = self.list_models()
        return model_name in available_models

    @staticmethod
    def get_default_model_paths() -> list:
        """Get default Ollama model paths for different platforms."""
        system = platform.system().lower()
        home = Path.home()

        if system == "linux":
            paths = [
                home / ".ollama" / "models",
                Path("/var/lib/ollama/models"),
                Path("/usr/local/lib/ollama/models")
            ]
        elif system == "darwin":  # macOS
            paths = [
                home / ".ollama" / "models",
                Path("/usr/local/lib/ollama/models")
            ]
        elif system == "windows":
            paths = [
                home / ".ollama" / "models",
                Path(os.environ.get("PROGRAMDATA", "C:\\ProgramData")) / "Ollama" / "models"
            ]
        else:
            paths = [home / ".ollama" / "models"]

        return [p for p in paths if p.exists()]


# Global instance
ollama_client = None

def get_ollama_client() -> OllamaClient:
    """Get or create the global Ollama client instance."""
    global ollama_client
    if ollama_client is None:
        from app.core.config import settings
        ollama_client = OllamaClient(
            host=settings.OLLAMA_HOST,
            model=settings.OLLAMA_MODEL,
            offline_mode=getattr(settings, 'OFFLINE_MODE', False)
        )
    return ollama_client
