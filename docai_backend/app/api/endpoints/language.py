from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import logging

log = logging.getLogger(__name__)

from app.core.config import settings
from app.agents.language_detect_agent import language_detect_agent
from app.agents.translator_agent import translator_agent

router = APIRouter()

class LanguageDetectionRequest(BaseModel):
    text: str

class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str

@router.get("/supported")
async def get_supported_languages():
    """Get list of supported languages"""
    try:
        supported_languages = settings.SUPPORTED_LANGUAGES.split(',')
        translation_pairs = list(settings.TRANSLATION_MODELS.keys())
        
        return JSONResponse(content={
            "supported_languages": supported_languages,
            "translation_pairs": translation_pairs,
            "translation_enabled": settings.ENABLE_TRANSLATION,
            "detection_method": settings.LANG_DETECT_METHOD
        })
    except Exception as e:
        log.error(f"Error getting supported languages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect")
async def detect_language(request: LanguageDetectionRequest):
    """Detect language of given text"""
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        detected_lang = language_detect_agent.detect_lang(request.text)
        
        return JSONResponse(content={
            "text": request.text[:100] + "..." if len(request.text) > 100 else request.text,
            "detected_language": detected_lang,
            "confidence": "high" if detected_lang != "en" else "medium",  # Simple heuristic
            "method": settings.LANG_DETECT_METHOD
        })
    except Exception as e:
        log.error(f"Error detecting language: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate")
async def translate_text(request: TranslationRequest):
    """Translate text between languages"""
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        if not settings.ENABLE_TRANSLATION:
            raise HTTPException(status_code=503, detail="Translation is disabled")
        
        # Check if translation pair is supported
        translation_pair = f"{request.source_lang}-{request.target_lang}"
        if translation_pair not in settings.TRANSLATION_MODELS:
            raise HTTPException(
                status_code=400, 
                detail=f"Translation pair {translation_pair} not supported"
            )
        
        translated_text = translator_agent.translate(
            request.text, 
            request.source_lang, 
            request.target_lang
        )
        
        return JSONResponse(content={
            "original_text": request.text,
            "translated_text": translated_text,
            "source_language": request.source_lang,
            "target_language": request.target_lang,
            "translation_pair": translation_pair
        })
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error translating text: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_language_status():
    """Get status of language services"""
    try:
        # Check if translation models are loaded
        translation_status = {}
        for pair, model in translator_agent.models.items():
            translation_status[pair] = "available" if model is not None else "unavailable"
        
        # Check detection method
        detection_available = hasattr(language_detect_agent, 'detect_func')
        
        return JSONResponse(content={
            "detection": {
                "available": detection_available,
                "method": settings.LANG_DETECT_METHOD,
                "supported_languages": settings.SUPPORTED_LANGUAGES.split(',')
            },
            "translation": {
                "enabled": settings.ENABLE_TRANSLATION,
                "models": translation_status,
                "cache_size": len(translator_agent.cache)
            },
            "config": {
                "offline_mode": settings.OFFLINE_MODE,
                "hf_cache_dir": settings.HF_MULTILINGUAL_CACHE
            }
        })
    except Exception as e:
        log.error(f"Error getting language status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clear-cache")
async def clear_translation_cache():
    """Clear translation cache"""
    try:
        translator_agent.clear_cache()
        return JSONResponse(content={
            "message": "Translation cache cleared successfully",
            "cache_size": len(translator_agent.cache)
        })
    except Exception as e:
        log.error(f"Error clearing translation cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))