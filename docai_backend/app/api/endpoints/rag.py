import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from app.services.rag_service import rag_service
from app.agents.generator_agent import generator_agent

log = logging.getLogger(__name__)

router = APIRouter()

@router.post("/query")
async def rag_query(
    request: Dict[str, str],
    document_id: str = Query(..., description="Document ID to search in")
):
    """
    Execute a RAG query and return streaming response.

    Request body:
    {
        "query": "user question"
    }
    """
    try:
        query = request.get("query", "").strip()
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        if not document_id:
            raise HTTPException(status_code=400, detail="Document ID is required")

        async def generate_response():
            try:
                async for chunk in rag_service.query(query, document_id, stream=True):
                    yield f"data: {chunk}\n\n"
            except Exception as e:
                log.error(f"Error in streaming response: {e}")
                yield f"data: Error: {str(e)}\n\n"

        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error in rag_query: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/stream/{document_id}")
async def rag_stream(
    document_id: str,
    query: str = Query(..., description="User query")
):
    """
    Stream RAG response with metadata for a document.
    """
    try:
        if not query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        async def generate_stream():
            try:
                async for response_data in rag_service.get_streaming_response(query, document_id):
                    import json
                    yield f"data: {json.dumps(response_data)}\n\n"
            except Exception as e:
                log.error(f"Error in streaming response: {e}")
                error_data = {
                    "type": "error",
                    "message": str(e)
                }
                import json
                yield f"data: {json.dumps(error_data)}\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error in rag_stream: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/embed/search/{document_id}")
async def embed_search_adapter(
    document_id: str,
    query: str = Query(..., description="Search query")
):
    """
    Adapter endpoint to maintain compatibility with existing frontend.
    Maps to the new RAG query endpoint.
    """
    try:
        if not query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        # Use RAG service but return in the format expected by frontend
        results = []

        async for chunk in rag_service.query(query, document_id, stream=False):
            # Collect the full response
            full_response = ""
            full_response += chunk

        # Return in embedding search format for compatibility
        return {
            "results": [
                {
                    "text": full_response,
                    "distance": 0.1,  # Mock distance for compatibility
                    "metadata": {
                        "source": "RAG",
                        "confidence": "high"
                    }
                }
            ],
            "total": 1
        }

    except Exception as e:
        log.error(f"Error in embed_search_adapter: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health/ollama")
async def check_ollama_health():
    """
    Check if Ollama is running and accessible.
    """
    try:
        health_status = await generator_agent.check_ollama_health()
        return health_status
    except Exception as e:
        log.error(f"Error checking Ollama health: {e}")
        return {
            "status": "error",
            "error": str(e)
        }

@router.post("/cache/clear")
async def clear_cache(request: Dict[str, Any] = None):
    """
    Clear the RAG cache.

    Request body (optional):
    {
        "document_id": "specific_document_id"  # If not provided, clears all cache
    }
    """
    try:
        document_id = request.get("document_id") if request else None
        rag_service.clear_cache(document_id)

        return {
            "message": f"Cache cleared{' for document ' + document_id if document_id else ''}",
            "status": "success"
        }

    except Exception as e:
        log.error(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
