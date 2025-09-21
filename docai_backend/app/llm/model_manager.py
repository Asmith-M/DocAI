import os
import logging
import asyncio
from typing import Dict, List, Optional, Any
from app.core.config import settings
from app.llm.ollama_client import get_ollama_client

log = logging.getLogger(__name__)

class ModelManager:
    def __init__(self):
        self.ollama_client = get_ollama_client()
        self.preloaded_models: Dict[str, Dict[str, Any]] = {}
        self.model_memory_usage: Dict[str, int] = {
            # Estimated memory usage in MB for common models
            "gemma:2b": 2048,
            "gemma:7b": 7168,
            "mistral:7b": 7168,
            "llama2:7b": 7168,
            "llama2:13b": 14336,
            "codellama:7b": 7168,
            "codellama:13b": 14336,
        }

    def get_available_models(self) -> List[str]:
        """Get list of available models in Ollama"""
        if not self.ollama_client:
            return []
        return self.ollama_client.list_models()

    def preload_model(self, model_name: str) -> Dict[str, Any]:
        """
        Preload a model into Ollama memory.
        Returns status dict with success/error info.
        """
        if not self.ollama_client:
            return {
                "success": False,
                "error": "Ollama client not initialized",
                "model": model_name
            }

        try:
            # Check if model exists
            if not self.ollama_client.check_model_exists(model_name):
                return {
                    "success": False,
                    "error": f"Model {model_name} not found in Ollama",
                    "model": model_name
                }

            # Pull/load the model
            if self.ollama_client.pull_model(model_name):
                self.preloaded_models[model_name] = {
                    "loaded_at": asyncio.get_event_loop().time(),
                    "memory_mb": self.model_memory_usage.get(model_name, 4096),
                    "status": "loaded"
                }

                log.info(f"Successfully preloaded model: {model_name}")
                return {
                    "success": True,
                    "message": f"Model {model_name} preloaded successfully",
                    "model": model_name,
                    "memory_mb": self.preloaded_models[model_name]["memory_mb"]
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to preload model {model_name}",
                    "model": model_name
                }

        except Exception as e:
            error_msg = f"Error preloading model {model_name}: {str(e)}"
            log.error(error_msg)
            return {
                "success": False,
                "error": error_msg,
                "model": model_name
            }

    def unload_model(self, model_name: str) -> Dict[str, Any]:
        """
        Unload a model from Ollama memory.
        Note: Ollama doesn't have direct unload, but we can track status.
        """
        if model_name in self.preloaded_models:
            self.preloaded_models[model_name]["status"] = "unloaded"
            log.info(f"Marked model {model_name} as unloaded")
            return {
                "success": True,
                "message": f"Model {model_name} marked as unloaded",
                "model": model_name
            }
        else:
            return {
                "success": False,
                "error": f"Model {model_name} not found in preloaded models",
                "model": model_name
            }

    def get_model_status(self, model_name: str) -> Dict[str, Any]:
        """Get status of a specific model"""
        if model_name in self.preloaded_models:
            return self.preloaded_models[model_name]
        else:
            return {"status": "not_loaded"}

    def get_memory_usage(self) -> Dict[str, Any]:
        """Get total memory usage of preloaded models"""
        total_memory = sum(
            model_info["memory_mb"]
            for model_info in self.preloaded_models.values()
            if model_info["status"] == "loaded"
        )

        return {
            "total_memory_mb": total_memory,
            "models_loaded": [
                {"name": name, "memory_mb": info["memory_mb"]}
                for name, info in self.preloaded_models.items()
                if info["status"] == "loaded"
            ]
        }

    def get_recommended_models(self, hardware_spec: str = "standard") -> List[Dict[str, Any]]:
        """
        Get recommended models based on hardware specifications.
        """
        recommendations = {
            "low_spec": [
                {"name": "gemma:2b", "memory_mb": 2048, "description": "Lightweight, good for basic tasks"},
            ],
            "standard": [
                {"name": "gemma:7b", "memory_mb": 7168, "description": "Balanced performance and memory"},
                {"name": "mistral:7b", "memory_mb": 7168, "description": "Good general purpose model"},
            ],
            "high_spec": [
                {"name": "llama2:13b", "memory_mb": 14336, "description": "High performance for complex tasks"},
                {"name": "codellama:13b", "memory_mb": 14336, "description": "Excellent for code-related tasks"},
            ]
        }

        return recommendations.get(hardware_spec, recommendations["standard"])

# Global instance
model_manager = ModelManager()
