import logging
from typing import Optional
from app.core.config import settings

log = logging.getLogger(__name__)

class LanguageDetectAgent:
    def __init__(self):
        self.supported_langs = settings.SUPPORTED_LANGUAGES.split(',')
        self.method = settings.LANG_DETECT_METHOD

        if self.method == "langdetect":
            try:
                from langdetect import detect
                self.detect_func = detect
                log.info("Language detection initialized with langdetect")
            except ImportError:
                log.warning("langdetect not available, falling back to basic detection")
                self.detect_func = self._basic_detect
        else:
            log.warning(f"Unsupported detection method {self.method}, using basic detection")
            self.detect_func = self._basic_detect

    def detect_lang(self, text: str) -> str:
        """
        Detect the language of the given text.
        Returns language code (e.g., 'en', 'hi', 'mr') or 'en' as fallback.
        """
        if not text or not text.strip():
            return 'en'

        # Check if text has sufficient alphabetic characters for language detection
        stripped_text = text.strip()
        alpha_count = sum(1 for char in stripped_text if char.isalpha())
        if alpha_count < 3:  # Require at least 3 alphabetic characters
            return 'en'

        try:
            detected = self.detect_func(stripped_text)
            # Normalize to our supported languages
            if detected in self.supported_langs:
                return detected
            elif detected.startswith('hi'):  # Handle variants
                return 'hi'
            elif detected.startswith('mr'):
                return 'mr'
            else:
                log.info(f"Detected unsupported language {detected}, defaulting to 'en'")
                return 'en'
        except Exception as e:
            log.warning(f"Language detection failed: {e}, defaulting to 'en'")
            return 'en'

    def _basic_detect(self, text: str) -> str:
        """
        Basic language detection based on character sets.
        Very simple heuristic for Hindi/Marathi vs English.
        """
        # Count Devanagari characters (used in Hindi/Marathi)
        devanagari_count = sum(1 for char in text if '\u0900' <= char <= '\u097F')

        if devanagari_count > len(text) * 0.1:  # If >10% Devanagari chars
            # Simple heuristic: if 'म' (ma) appears, likely Marathi
            if 'म' in text:
                return 'mr'
            else:
                return 'hi'
        else:
            return 'en'

# Global instance
language_detect_agent = LanguageDetectAgent()