import asyncio
import time
import uuid
from typing import Dict, Any, AsyncGenerator
from loguru import logger
import json

from app.agents.chunk_agent import ChunkAgent
from app.agents.ranker_agent import RankerAgent
from app.agents.generator_agent import GeneratorAgent
from app.agents.verifier_agent import verifier_agent
from app.agents.translator_agent import translator_agent
from app.cache.rag_cache import get_cached_candidates, set_cached_candidates, get_cached_answer, set_cached_answer
from app.services.embedding_service import embedding_service
from app.core.config import settings


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
    ) -> AsyncGenerator[str, None]:
        """
        Handle a query in English only. Language handling is done by MultilangOrchestrator.
        Returns an async generator - single JSON for non-streaming, multiple events for streaming.
        """
        if not request_id:
            request_id = str(uuid.uuid4())

        logger.info(f"🚀 Starting RAG query for doc {document_id}, request_id {request_id}")
        logger.info(f"📝 Processing English query: {question}")
        logger.info(f"⚙️ Parameters: top_k={top_k}, return_top={return_top}, stream={stream}")

        start_time = time.time()

        # Step 1: Retrieval from English index
        retrieval_start = time.time()
        logger.info(f"🔍 Step 1: Starting English retrieval for request_id {request_id}")

        cached = get_cached_candidates(document_id, question)
        if cached:
            candidates = cached
            logger.info(f"✅ Retrieved cached candidates for request_id {request_id}")
            logger.info(f"📊 Found {len(candidates.get('chunks', []))} cached chunks")
        else:
            logger.info(f"🔄 No cache found, retrieving fresh candidates for request_id {request_id}")
            candidates = await self.ranker_agent.get_candidates(document_id, question, top_k, return_top)
            set_cached_candidates(document_id, question, candidates)
            logger.info(f"✅ Ranked candidates for request_id {request_id}")
            logger.info(f"📊 Ranker returned {len(candidates.get('chunks', []))} chunks")

        retrieval_ms = int((time.time() - retrieval_start) * 1000)
        logger.info(f"⏱️ Retrieval took {retrieval_ms}ms")

        # Check for cached answer
        cached_answer = get_cached_answer(document_id, question)
        if cached_answer:
            logger.info(f"✅ Retrieved cached answer for request_id {request_id}")
            total_ms = int((time.time() - start_time) * 1000)
            cached_answer["timings_ms"]["total"] = total_ms
            yield json.dumps(cached_answer)
            return

        if stream:
            async for event in self._stream_response(candidates, question, request_id, retrieval_ms):
                yield event
        else:
            logger.info(f"📝 Step 2: Starting generation for request_id {request_id}")
            generation_start = time.time()

            # Use English for generation
            translated_chunks = candidates["chunks"]

            generation_question = question

            answer = await self.generator_agent.generate(generation_question, translated_chunks, stream=False, request_id=request_id)
            generation_ms = int((time.time() - generation_start) * 1000)
            logger.info(f"✅ Generation completed for request_id {request_id}, took {generation_ms}ms")
            logger.info(f"📄 Answer length: {len(answer)} characters")

            # Try JSON parsing
            parsed_answer = self._parse_json_response(answer)
            final_answer = parsed_answer.get("answer", answer) if parsed_answer else answer

            # Step 3: Verification
            logger.info(f"🔍 Step 3: Starting verification for request_id {request_id}")
            verification_start = time.time()

            if not question or not final_answer or not candidates.get("chunks"):
                logger.warning(f"⚠️ Invalid inputs for verification - question: {bool(question)}, answer: {bool(final_answer)}, chunks: {bool(candidates.get('chunks'))}")
                verification_result = {
                    "confidence_score": 0.0,
                    "verification_status": "failed",
                    "reason": "Invalid or empty inputs provided"
                }
            else:
                # Always verify in English
                verification_result = await verifier_agent.verify_answer(question, final_answer, candidates["chunks"])

            verification_ms = int((time.time() - verification_start) * 1000)
            logger.info(f"✅ Verification completed for request_id {request_id}, took {verification_ms}ms")
            logger.info(f"🎯 Verification confidence: {verification_result.get('confidence_score', 0):.2f}")

            total_ms = int((time.time() - start_time) * 1000)
            logger.info(f"🏁 Completed RAG query for request_id {request_id}, total_ms {total_ms}")

            result = {
                "answer": final_answer,
                "sources": translated_chunks,
                "verification_result": verification_result,
                "timings_ms": {
                    "retrieval": retrieval_ms,
                    "generation": generation_ms,
                    "verification": verification_ms,
                    "total": total_ms
                },
                "model": {
                    "provider": "ollama",
                    "model": self.generator_agent.current_model or "gemma:2b"
                }
            }

            # Cache the answer
            set_cached_answer(document_id, question, result)
            logger.info(f"💾 Cached answer for document {document_id}, question: {question[:50]}...")

            yield json.dumps(result)

    async def _stream_response(self, candidates: Dict, question: str, request_id: str, retrieval_ms: int) -> AsyncGenerator[str, None]:
        """Stream response events in English. All chunks and answers are handled in English."""
        logger.info(f"📡 Starting streaming response for request_id {request_id}")
        
        try:
            # Meta event with model info
            yield f'data: {json.dumps({"type":"meta","data":{
                "request_id": request_id,
                "model": self.generator_agent.current_model or "gemma:2b",
                "language": "en"  # Always English for RAG
            }})}\n\n'

            # Get and validate chunks
            chunks = candidates.get("chunks", [])
            if not chunks:
                logger.warning(f"⚠️ No context chunks available for request_id {request_id}")
                yield f'data: {json.dumps({"type":"error","data":{
                    "error": "No relevant context found",
                    "request_id": request_id
                }})}\n\n'
                return

            # Stream source information
            logger.info(f"📚 Streaming {len(chunks)} source chunks")
            for chunk in chunks:
                source_data = {
                    "chunk_id": chunk.get("id", "unknown"),
                    "page": chunk.get("page", 0),
                    "snippet": chunk.get("text", "")[:200] + "..." if len(chunk.get("text", "")) > 200 else chunk.get("text", ""),
                    "relevance": chunk.get("relevance_score", 0.0),
                    "extraction_method": chunk.get("extraction_method", "unknown")
                }
                yield f'data: {json.dumps({"type":"source","data": source_data})}\n\n'

            # Initialize generation
            yield f'data: {json.dumps({"type":"answer","data":{"answer":""}})}\n\n'
            generation_start = time.time()
            logger.info(f"🎯 Starting answer generation for request_id {request_id}")

            # Generate answer
            full_answer = ""
            generator = await self.generator_agent.generate(question, chunks, stream=True, request_id=request_id)
            try:
                async for token in generator:
                    full_answer += token
                    yield f'data: {json.dumps({"type":"token","data":token})}\n\n'
            except Exception as e:
                logger.error(f"❌ Generation error: {type(e).__name__} - {str(e)}")
                yield f'data: {json.dumps({"type":"error","data":{"error": str(e)}})}\n\n'
                raise

            # Calculate timings
            generation_ms = int((time.time() - generation_start) * 1000)
            logger.info(f"⏱️ Generation completed in {generation_ms}ms")

            # Verify answer
            verification_start = time.time()
            try:
                logger.info("🔍 Starting answer verification")
                verification_result = await verifier_agent.verify_answer(question, full_answer, chunks)
                verification_ms = int((time.time() - verification_start) * 1000)
                logger.info(f"✅ Verification completed in {verification_ms}ms - Score: {verification_result.get('confidence_score', 0):.2f}")
            except Exception as e:
                logger.error(f"❌ Verification error: {type(e).__name__} - {str(e)}")
                verification_result = {
                    "confidence_score": 0.0,
                    "verification_status": "error",
                    "reason": str(e)
                }
                verification_ms = 0

            # Final response
            total_ms = retrieval_ms + generation_ms + verification_ms
            yield f'data: {json.dumps({"type":"complete","data":{
                "answer": full_answer,
                "verification": verification_result,
                "timings_ms": {
                    "retrieval": retrieval_ms,
                    "generation": generation_ms,
                    "verification": verification_ms,
                    "total": total_ms
                }
            }})}\n\n'

        except Exception as e:
            logger.error(f"❌ Streaming error: {type(e).__name__} - {str(e)}")
            yield f'data: {json.dumps({"type":"error","data":{"error": str(e)}})}\n\n'
            raise





    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        if not response or not response.strip():
            return None
        try:
            return json.loads(response.strip())
        except json.JSONDecodeError:
            response = response.strip()
            json_match = response.find('```json')
            if json_match != -1:
                json_start = json_match + 7
                json_end = response.find('```', json_start)
                if json_end != -1:
                    try:
                        return json.loads(response[json_start:json_end].strip())
                    except json.JSONDecodeError:
                        pass
            brace_start = response.find('{')
            if brace_start != -1:
                brace_count = 0
                for i, char in enumerate(response[brace_start:], brace_start):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            try:
                                return json.loads(response[brace_start:i+1])
                            except json.JSONDecodeError:
                                pass
                            break
            return None
        except Exception as e:
            logger.error(f"Error parsing JSON response: {e}")
            return None

    def _extract_partial_answer(self, partial_json: str) -> str:
        try:
            answer_start = partial_json.find('"answer":')
            if answer_start == -1:
                return None
            quote_start = partial_json.find('"', answer_start + 9)
            if quote_start == -1:
                return None
            current_pos = quote_start + 1
            answer_content = ""
            while current_pos < len(partial_json):
                char = partial_json[current_pos]
                if char == '"' and (current_pos == 0 or partial_json[current_pos - 1] != '\\'):
                    return answer_content
                elif char == '\\' and current_pos + 1 < len(partial_json):
                    answer_content += char + partial_json[current_pos + 1]
                    current_pos += 2
                else:
                    answer_content += char
                    current_pos += 1
            return answer_content if answer_content else None
        except Exception as e:
            logger.debug(f"Error extracting partial answer: {e}")
            return None


# Global instance
rag_orchestrator = RAGOrchestrator()
