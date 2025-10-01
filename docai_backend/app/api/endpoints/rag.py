# docai_backend/app/api/endpoints/rag.py

import asyncio
import json
import uuid
from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.responses import StreamingResponse, JSONResponse
from loguru import logger

from app.orchestrator.rag_orchestrator import rag_orchestrator
from app.orchestrator.multilang_orchestrator import MultilangOrchestrator
from app.cache.rag_cache import clear_cache

# Initialize multilingual orchestrator
multilang_orchestrator = MultilangOrchestrator(rag_orchestrator)

router = APIRouter()

# A single, robust endpoint for non-streaming queries
@router.post("/query")
async def rag_query(request: Request, response: Response):
    body = await request.json()
    
    # Get document_id from body first, then fallback to query params for compatibility
    document_id = body.get("document_id") or request.query_params.get("document_id")
    
    # Get question from common keys like "question" or "query"
    question = body.get("question") or body.get("query")

    if not document_id or not question:
        raise HTTPException(status_code=400, detail="Missing document_id or question in body/params")

    # Get optional parameters
    top_k = body.get("top_k", 10)
    return_top = body.get("return_top", 5)
    stream = body.get("stream", False)
    lang = body.get("lang")
    auto_detect = body.get("auto_detect", False)
    
    # If auto_detect is True or lang is not provided, use auto-detection
    if auto_detect or not lang:
        lang = "auto_detect"

    request_id = str(uuid.uuid4())
    response.headers["X-Correlation-Id"] = request_id

    try:
        # NOTE: This endpoint now only handles non-streaming for clarity.
        # Streaming requests should go to the POST /stream/{document_id} endpoint.
        if stream:
             raise HTTPException(status_code=400, detail="Streaming is not supported on /query. Please use the POST /stream/{document_id} endpoint.")

        # Non-stream response using multilingual orchestrator
        async for result_json in multilang_orchestrator.handle_query(
            document_id=document_id, 
            question=question, 
            top_k=top_k, 
            return_top=return_top, 
            stream=False, 
            request_id=request_id, 
            lang=lang
        ):
            # For non-streaming, handle_query yields a single JSON result
            result = json.loads(result_json)
            break  # We only expect one result for non-streaming
            
        return JSONResponse(content=result, headers={"X-Correlation-Id": request_id})
        
    except Exception as e:
        logger.error(f"Error in /api/rag/query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# The primary endpoint for streaming queries
@router.post("/stream/{document_id}")
async def rag_stream_post(document_id: str, request: Request, response: Response):
    """
    Handles a streaming RAG query via POST request.
    The query is sent in the request body as JSON: {"query": "your question"}
    """
    try:
        body = await request.json()
        query = body.get("query")
        if not query:
            raise HTTPException(status_code=400, detail="Missing 'query' in request body")

        # Get optional language parameter and auto-detect flag
        lang = body.get("lang")
        auto_detect = body.get("auto_detect", False)
        
        # If auto_detect is True or lang is not provided, use auto-detection
        if auto_detect or not lang:
            lang = "auto_detect"

        request_id = str(uuid.uuid4())
        response.headers["X-Correlation-Id"] = request_id

        async def event_generator():
            try:
                # Use multilingual orchestrator for streaming
                async for event in multilang_orchestrator.handle_query(
                    document_id=document_id, 
                    question=query, 
                    stream=True, 
                    request_id=request_id, 
                    lang=lang
                ):
                    # Fix: If event is coroutine, await it before yielding
                    if asyncio.iscoroutine(event):
                        event = await event
                    # If event is dict or other non-string, convert to JSON string
                    if not isinstance(event, str):
                        try:
                            event = json.dumps(event)
                        except Exception as e:
                            logger.error(f"JSON serialization error in stream event: {e}")
                            event = json.dumps({"type": "error", "data": {"code": "JSON_SERIALIZATION_ERROR", "message": str(e)}})
                    yield event
            except Exception as e:
                logger.error(f"Error during stream generation for request {request_id}: {e}")
                error_event = json.dumps({"type": "error", "data": {"code": "STREAM_ERROR", "message": str(e)}})
                yield f"data: {error_event}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in request body")
    except Exception as e:
        logger.error(f"Unhandled error in /stream/{document_id}: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")

# Other endpoints remain the same
@router.post("/cancel/{request_id}")
async def rag_cancel(request_id: str):
    logger.info(f"Received cancel request for {request_id}")
    return JSONResponse(content={"message": f"Cancel request received for {request_id}"})

@router.get("/prefetch/{document_id}")
async def rag_prefetch(document_id: str):
    logger.info(f"Received prefetch request for {document_id}")
    clear_cache(document_id)
    return JSONResponse(content={"message": f"Prefetch cache cleared for {document_id}"})