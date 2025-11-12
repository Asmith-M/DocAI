import logging
from typing import Optional, Dict
from transformers import pipeline
from app.core.config import settings

# Check if transformers is available
try:
    # Test transformers availability
    pipeline("translation", model="Helsinki-NLP/opus-mt-en-fr")
    logging.getLogger(__name__).info("Transformers library initialized successfully")
except Exception as e:
    logging.getLogger(__name__).warning(f"Transformers library not available: {e}")

from app.utils.agent_timer import log_time

log = logging.getLogger(__name__)

class TranslatorAgent:
    def __init__(self):
        self.models = {}
        self.cache: Dict[str, str] = {}  # Simple cache: key = (text, src, tgt), value = translated
        self.cache_size = 1000  # Limit cache size

        # Load translation models based on config
        for pair, model_name in settings.TRANSLATION_MODELS.items():
            try:
                src_tgt = pair.split('-')
                src, tgt = src_tgt[0], src_tgt[1]
                model_path = settings.MULTILINGUAL_EMBEDDING_MODEL_PATH if model_name.startswith('./') else model_name
                translator = pipeline(
                    'translation',
                    model=model_name,
                    cache_dir=settings.HF_MULTILINGUAL_CACHE,
                    local_files_only=settings.OFFLINE_MODE
                )
                self.models[pair] = translator
                log.info(f"Loaded translation model for {pair}: {model_name}")
            except Exception as e:
                log.warning(f"Failed to load translation model for {pair}: {e}. Translation will be disabled for this pair.")
                self.models[pair] = None

    @log_time
    def translate(self, text: str, src_lang: str, tgt_lang: str, max_length: int = 512) -> str:
        """
        Translate text from src_lang to tgt_lang.
        Returns translated text or original if model unavailable/fallback.
        """
        if not text or not text.strip():
            return text

        pair = f"{src_lang}-{tgt_lang}"
        cache_key = f"{text[:50]}..._{src_lang}_{tgt_lang}"  # Truncated key for cache

        # Check cache
        if cache_key in self.cache:
            log.debug(f"Translation cache hit for {pair}")
            return self.cache[cache_key]

        translator = self.models.get(pair)
        if not translator:
            log.warning(f"No translator available for {pair}, returning original text")
            return text

        try:
            # Translate
            result = translator(text, max_length=max_length)
            translated = result[0]['translation_text']
            
            # Cache result
            if len(self.cache) >= self.cache_size:
                # Simple eviction: remove oldest (first key)
                first_key = next(iter(self.cache))
                del self.cache[first_key]
            self.cache[cache_key] = translated

            log.debug(f"Translated from {src_lang} to {tgt_lang}: {translated[:50]}...")
            return translated

        except Exception as e:
            log.error(f"Translation failed for {pair}: {e}")
            return text  # Fallback to original

    def clear_cache(self):
        """Clear translation cache"""
        self.cache.clear()
        log.info("Translation cache cleared")

# Global instance
translator_agent = TranslatorAgent()
