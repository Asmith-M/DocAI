# docai_backend/app/orchestrator/rag_orchestrator.py
import asyncio
import time
import uuid
from typing import Dict, Any, List, AsyncGenerator, Union
from loguru import logger
import json

from app.agents.chunk_agent import ChunkAgent
from app.agents.ranker_agent import RankerAgent
from app.agents.generator_agent import GeneratorAgent
from app.agents.verifier_agent import verifier_agent
from app.cache.rag_cache import get_cached_candidates, set_cached_candidates
from app.services.embedding_service import embedding_service

class RAGOrchestrator:
    def __init__(self):
        self.chunk_agent = ChunkAgent()
        self.ranker_agent = RankerAgent()
        self.generator_agent = GeneratorAgent()
        # Use the imported verifier_agent instance

    async def handle_query(
        self,
        document_id: str,
        question: str,
        top_k: int = 10,
        return_top: int = 5,
        stream: bool = False,
        request_id: str = None,
        lang: str = None
    ) -> AsyncGenerator[str, None]:
        """
        This method now always returns an async generator.
        For non-streaming, it yields a single JSON result.
        For streaming, it yields multiple events.
        """
        if not request_id:
            request_id = str(uuid.uuid4())

        logger.info(f"🚀 Starting RAG query for doc {document_id}, request_id {request_id}")
        logger.info(f"📝 Question: {question}")
        logger.info(f"⚙️ Parameters: top_k={top_k}, return_top={return_top}, stream={stream}")

        start_time = time.time()

        # Step 1: Retrieval - Get candidates from cache or ranker
        retrieval_start = time.time()
        logger.info(f"🔍 Step 1: Starting retrieval for request_id {request_id}")

        cached = get_cached_candidates(document_id, question)
        if cached:
            candidates = cached
            logger.info(f"✅ Retrieved cached candidates for request_id {request_id}")
            logger.info(f"📊 Found {len(candidates.get('chunks', []))} cached chunks")
        else:
            logger.info(f"🔄 No cache found, calling ranker agent for request_id {request_id}")
            candidates = await self.ranker_agent.get_candidates(document_id, question, top_k, return_top, lang=lang)
            set_cached_candidates(document_id, question, candidates)
            logger.info(f"✅ Ranked candidates for request_id {request_id}")
            logger.info(f"📊 Ranker returned {len(candidates.get('chunks', []))} chunks")

        retrieval_ms = int((time.time() - retrieval_start) * 1000)
        logger.info(f"⏱️ Retrieval took {retrieval_ms}ms")

        if stream:
            # Streaming response - yield multiple events
            async for event in self._stream_response(candidates, question, request_id, retrieval_ms):
                yield event
        else:
            # Non-streaming response - yield single JSON result
            logger.info(f"📝 Step 2: Starting generation for request_id {request_id}")
            generation_start = time.time()
            # generator_agent.generate is implemented as an async generator. For non-streaming mode
            # it yields a single result which we need to collect by iterating the generator.
            answer = None
            gen = self.generator_agent.generate(question, candidates["chunks"], stream=False, request_id=request_id)
            async for item in gen:
                answer = item
            generation_ms = int((time.time() - generation_start) * 1000)
            logger.info(f"✅ Generation completed for request_id {request_id}, took {generation_ms}ms")
            logger.info(f"📄 Answer length: {len(answer)} characters")

            # Step 3: Verification (for non-streaming case)
            logger.info(f"🔍 Step 3: Starting verification for request_id {request_id}")
            verification_start = time.time()

            # Validate inputs before calling verifier agent
            if not question or not answer or not candidates.get("chunks"):
                logger.warning(f"⚠️ Invalid inputs for verification - question: {bool(question)}, answer: {bool(answer)}, chunks: {bool(candidates.get('chunks'))}")
                verification_result = {
                    "confidence_score": 0.0,
                    "verification_status": "failed",
                    "reason": "Invalid or empty inputs provided"
                }
            else:
                verification_result = verifier_agent.verify_answer(question, answer, candidates["chunks"])

            verification_ms = int((time.time() - verification_start) * 1000)
            logger.info(f"✅ Verification completed for request_id {request_id}, took {verification_ms}ms")
            logger.info(f"🎯 Verification confidence: {verification_result.get('confidence_score', 0):.2f}")

            total_ms = int((time.time() - start_time) * 1000)
            logger.info(f"🏁 Completed RAG query for request_id {request_id}, total_ms {total_ms}")

            result = {
                "answer": answer,
                "sources": candidates["chunks"],
                "verification_result": verification_result,
                "timings_ms": {
                    "retrieval": retrieval_ms,
                    "generation": generation_ms,
                    "verification": verification_ms,
                    "total": total_ms
                },
                "model": {
                    "provider": "ollama",
                    "model": "gemma:2b"
                }
            }

            # Yield the result as a single event
            yield json.dumps(result)

    async def _stream_response(self, candidates: Dict, question: str, request_id: str, retrieval_ms: int) -> AsyncGenerator[str, None]:
        # Emit meta event
        yield f'data: {json.dumps({"type":"meta","data":{"request_id":request_id,"model":"gemma:2b"}})}\n\n'

        # Emit sources
        for chunk in candidates["chunks"]:
            source_data = {
                "chunk_id": chunk.get("id", "unknown"),
                "page": chunk.get("page", 0),
                "snippet": chunk.get("text", "")[:200] + "..." if len(chunk.get("text", "")) > 200 else chunk.get("text", ""),
                "relevance": chunk.get("relevance_score", 0.0),
                "extraction_method": chunk.get("extraction_method", "unknown")
            }
            yield f'data: {json.dumps({"type":"source","data": source_data})}\n\n'

        # Stream tokens and accumulate full answer
        generation_start = time.time()
        full_answer = ""

        # Stream tokens from the generator agent
        async for token in self.generator_agent.generate(question, candidates["chunks"], stream=True, request_id=request_id):
            full_answer += token
            # Properly escape the token for JSON
            escaped_token = json.dumps(token)
            yield f'data: {{"type":"token","data":{escaped_token}}}\n\n'

        generation_ms = int((time.time() - generation_start) * 1000)
        total_ms = retrieval_ms + generation_ms

        # Verification with full answer - only if we have valid inputs
        if not question or not full_answer.strip() or not candidates.get("chunks"):
            logger.warning(f"⚠️ Invalid inputs for streaming verification - question: {bool(question)}, answer: {bool(full_answer.strip())}, chunks: {bool(candidates.get('chunks'))}")
            verification_result = {
                "confidence_score": 0.0,
                "verification_status": "failed",
                "reason": "Invalid or empty inputs provided"
            }
        else:
            verification_result = verifier_agent.verify_answer(question, full_answer, candidates["chunks"])

        # Emit done event
        done_data = {
            "answer": full_answer,
            "verification_result": verification_result,
            "timings_ms": {
                "retrieval": retrieval_ms,
                "generation": generation_ms,
                "total": total_ms
            },
            "model": {
                "provider": "ollama",
                "model": "gemma:2b"
            }
        }
        yield f'data: {json.dumps({"type":"done","data": done_data})}\n\n'

# Global instance
rag_orchestrator = RAGOrchestrator()