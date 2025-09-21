import os
from cachetools import TTLCache
from typing import Dict, Any

# In-process LRU cache for prefetch results
# Size and TTL configurable via env
CACHE_SIZE = int(os.getenv("RAG_CACHE_SIZE", "100"))
CACHE_TTL = int(os.getenv("RAG_CACHE_TTL", "3600"))  # 1 hour default

rag_cache = TTLCache(maxsize=CACHE_SIZE, ttl=CACHE_TTL)

def get_cached_candidates(document_id: str, question: str) -> Dict[str, Any]:
    key = f"{document_id}:{question}"
    return rag_cache.get(key)

def set_cached_candidates(document_id: str, question: str, candidates: Dict[str, Any]):
    key = f"{document_id}:{question}"
    rag_cache[key] = candidates

def clear_cache(document_id: str = None):
    if document_id:
        # Remove all keys starting with document_id
        keys_to_remove = [k for k in rag_cache.keys() if k.startswith(f"{document_id}:")]
        for k in keys_to_remove:
            del rag_cache[k]
    else:
        rag_cache.clear()
