# docai_backend/app/agents/generator_agent.py
import asyncio
import uuid
from typing import List, Dict, Any, AsyncGenerator
from loguru import logger
from app.llm.ollama_client import get_ollama_client
from app.core.config import settings
from enum import Enum, auto


class GeneratorAgent:
    def __init__(self):
        self.client = get_ollama_client()
        self.temperature = 0.0
        self.primary_model = settings.OLLAMA_MODEL
        self.fallback_model = settings.OLLAMA_MODEL_FALLBACK
        self.current_model = self.primary_model
        self.using_fallback = False
        concurrency_limit = getattr(settings, "GENERATOR_CONCURRENCY_LIMIT", 3)
        self.semaphore = asyncio.Semaphore(int(concurrency_limit))  # Configurable concurrency limit

    async def generate(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]],
        stream: bool = False,
        request_id: str = None,
        language: str = "en"
    ) -> Any:
        if not request_id:
            request_id = str(uuid.uuid4())

        logger.info(f"🤖 GeneratorAgent: Starting generation for request_id {request_id}")
        logger.info(f"📝 Question: {question}")
        logger.info(f"📊 Context chunks: {len(context_chunks)}")
        logger.info(f"🔄 Stream mode: {stream}")
        logger.info(f"🎯 Current model: {self.current_model}, Using fallback: {self.using_fallback}")
        logger.info(f"🌐 Language context: {language}")

        # Limit context chunks to top N and truncate text (~200 tokens ≈ 1000 chars)
        max_chunks = int(getattr(settings, "GENERATOR_MAX_CONTEXT_CHUNKS", 3))
        truncated_chunks = []
        for chunk in context_chunks[:max_chunks]:
            text = chunk.get("text", "")
            truncated_text = text[:1000]  # Approximate truncation
            truncated_chunks.append({**chunk, "text": truncated_text})

        logger.info(f"📊 Truncated to {len(truncated_chunks)} chunks")

        # Build prompt with language context
        prompt = self._build_prompt(question, truncated_chunks, language)
        logger.info(f"📝 Prompt length: {len(prompt)} characters")
        logger.info(f"📝 Final prompt:\n{prompt}")

        async with self.semaphore:
            logger.info(f"🔒 Acquired semaphore for request_id {request_id}")
            if stream:
                logger.info(f"📡 Starting streaming generation for request_id {request_id}")
                return self._stream_generate_with_fallback(prompt, request_id)
            else:
                logger.info(f"📝 Starting sync generation for request_id {request_id}")
                return await self._generate_sync_with_fallback(prompt, request_id)

    def _build_prompt(self, question: str, context_chunks: List[Dict[str, Any]], language: str = "en") -> str:
        """
        Build a structured prompt with dynamic system prompt including language instruction.
        """
        if not context_chunks:
            logger.warning("⚠️ No context chunks provided, using simple fallback prompt")
            return f"Question:\n{question}\n\nAnswer:"

        # Dynamic system prompt with language instruction
        system_prompt = (
            f"You are a helpful AI assistant. Answer the question based on the provided context. "
            f"Important: The user's query is in {language}. You must provide your final answer in {language} only. "
            f"Be concise and accurate."
        )

        # Truncate each chunk for safety
        max_chunk_size = int(getattr(settings, "GENERATOR_MAX_CHUNK_SIZE", 800))
        truncated_chunks = []
        for chunk in context_chunks:
            text = chunk.get("text", "")
            if len(text) > max_chunk_size:
                truncated_text = text[:max_chunk_size]
                last_period = truncated_text.rfind('.')
                if last_period > max_chunk_size * 0.8:
                    truncated_text = truncated_text[:last_period + 1]
                text = truncated_text
            truncated_chunks.append({**chunk, "text": text})

        # Build context section with metadata (Code 1 feature)
        context_sections = []
        for i, chunk in enumerate(truncated_chunks):
            page_info = f"Page {chunk.get('metadata', {}).get('page', 'unknown')}" if chunk.get('metadata', {}).get('page') else ""
            context_sections.append(f"[Source {i+1}] {page_info}\n{chunk.get('text', '')}")

        context_text = "\n\n".join(context_sections)

        # Final structured prompt
        prompt = f"""{system_prompt}

Context:
{context_text}

Question: {question}

Answer:"""

        return self._truncate_prompt(prompt, preserve_system=True)

    def _truncate_prompt(self, prompt: str, preserve_system: bool = False) -> str:
        """Truncate prompt (Code 1 advanced + Code 2’s safe cutoff)."""
        max_chars = settings.OLLAMA_CTX * 4  # Approximate: 1 token ~ 4 chars

        if len(prompt) <= max_chars:
            return prompt

        logger.warning(f"Prompt length {len(prompt)} exceeds context window {max_chars}, truncating")

        if preserve_system:
            system_end = prompt.find("Context:")
            question_start = prompt.find("Question:")

            if system_end > 0 and question_start > 0:
                system_part = prompt[:system_end]
                question_part = prompt[question_start:]

                available_chars = max_chars - len(system_part) - len(question_part) - 100
                if available_chars > 500:
                    context_part = prompt[system_end:question_start]
                    if len(context_part) > available_chars:
                        truncated_context = context_part[:available_chars]
                        last_period = truncated_context.rfind('.')
                        if last_period > available_chars * 0.7:
                            truncated_context = truncated_context[:last_period + 1]
                        truncated_prompt = system_part + truncated_context + "\n\n" + question_part
                        logger.info(f"Truncated prompt with preserved system to {len(truncated_prompt)} characters")
                        return truncated_prompt

        # Fallback: simple truncation (Code 2)
        truncated_prompt = prompt[:max_chars]
        last_space = truncated_prompt.rfind(" ")
        if last_space > max_chars * 0.9:
            truncated_prompt = truncated_prompt[:last_space]

        logger.info(f"Truncated prompt to {len(truncated_prompt)} characters")
        return truncated_prompt

    # ------------------------
    # Generation methods (same in both codes)
    # ------------------------

    async def _generate_sync(self, prompt: str, request_id: str) -> str:
        try:
            logger.info(f"🔧 GeneratorAgent: Calling client.generate_async for request_id {request_id}")
            logger.info(f"📝 Prompt length: {len(prompt)} characters")
            try:
                result = await asyncio.wait_for(
                    self.client.generate_async(prompt),
                    timeout=300.0
                )
                logger.info(f"✅ GeneratorAgent: Completed generation for request_id {request_id}")
                if isinstance(result, dict):
                    return result.get('response', '')
                return str(result)
            except asyncio.TimeoutError:
                logger.error(f"⏰ Generation timed out after 300s for request_id {request_id}")
                raise Exception("Generation timed out")
        except Exception as e:
            logger.error(f"❌ Error during generation for request_id {request_id}: {e}")
            raise

    async def _generate_sync_with_fallback(self, prompt: str, request_id: str) -> str:
        async def operation(prompt: str, request_id: str):
            result = await self.client.generate_async(prompt)
            return result.get('response', '') if isinstance(result, dict) else str(result)
        return await self._try_with_fallback(operation, prompt, request_id)

    async def _stream_generate(self, prompt: str, request_id: str) -> AsyncGenerator[str, None]:
        try:
            async for token in self.client.generate_stream_async(prompt):
                yield token
            logger.info(f"✅ Streaming generation completed for request_id {request_id}")
        except Exception as e:
            logger.error(f"❌ Streaming error for request_id {request_id}: {e}")
            raise

    class FallbackErrorType(Enum):
        """Enum for categorizing errors that should trigger fallback"""
        MEMORY = auto()
        MODEL_UNAVAILABLE = auto()
        TIMEOUT = auto()
        CONNECTION = auto()
        OTHER = auto()

    def _should_fallback(self, error: Exception) -> tuple[bool, FallbackErrorType]:
        """
        Determine if an error should trigger fallback to backup model.
        Returns (should_fallback: bool, error_type: FallbackErrorType)
        """
        error_msg = str(error).lower()
        error_type = type(error).__name__

        # Memory-related errors
        if any(ind in error_msg for ind in [
            "out of memory", "cuda out of memory", "insufficient memory",
            "memory allocation failed", "cannot allocate memory"
        ]):
            logger.error(f"Memory error detected: {error_type} - {error_msg}")
            return True, self.FallbackErrorType.MEMORY

        # Model availability errors
        if any(ind in error_msg for ind in [
            "model unavailable", "failed to load", "model not found",
            "initialization failed"
        ]):
            logger.error(f"Model availability error: {error_type} - {error_msg}")
            return True, self.FallbackErrorType.MODEL_UNAVAILABLE

        # Timeout errors
        if any(ind in error_msg for ind in ["timeout", "timed out", "deadline exceeded"]):
            logger.error(f"Timeout error: {error_type} - {error_msg}")
            return True, self.FallbackErrorType.TIMEOUT

        # Connection/network errors
        if isinstance(error, (ConnectionError, TimeoutError)) or any(ind in error_msg for ind in [
            "connection", "network", "unreachable"
        ]):
            logger.error(f"Connection error: {error_type} - {error_msg}")
            return True, self.FallbackErrorType.CONNECTION

        # Any other error types don't trigger fallback
        logger.warning(f"Non-fallback error encountered: {error_type} - {error_msg}")
        return False, self.FallbackErrorType.OTHER

    async def _stream_generate_with_fallback(self, prompt: str, request_id: str) -> AsyncGenerator[str, None]:
        """Stream tokens from the model with fallback support and comprehensive error handling"""
        try:
            logger.info(f"🎯 Starting streaming generation with model '{self.current_model}' for request {request_id}")
            async for token in self.client.generate_stream_async(prompt):
                yield token
            logger.info(f"✅ Streaming completed successfully for request {request_id}")

        except Exception as e:
            error_type = type(e).__name__
            error_msg = str(e)
            logger.error(f"❌ Streaming generation failed for request {request_id}: {error_type} - {error_msg}")
            
            should_fallback, fallback_type = self._should_fallback(e)
            if should_fallback and not self.using_fallback:
                logger.warning(f"⚠️ Attempting fallback for error type {fallback_type.name}")
                self._switch_to_fallback_model(request_id, e)
                
                try:
                    logger.info(f"🔄 Starting fallback generation with model '{self.current_model}'")
                    async for token in self.client.generate_stream_async(prompt):
                        yield token
                    logger.info(f"✅ Fallback streaming completed successfully")
                
                except Exception as fallback_e:
                    fallback_error = f"{type(fallback_e).__name__}: {str(fallback_e)}"
                    logger.error(f"❌ Fallback generation also failed: {fallback_error}")
                    raise Exception(f"Both primary and fallback models failed. Primary: {error_msg}, Fallback: {fallback_error}")
            
            else:
                if self.using_fallback:
                    logger.error(f"❌ Already using fallback model, no more retries available")
                else:
                    logger.error(f"❌ Error not eligible for fallback: {error_type}")
                raise e

    def _switch_to_fallback_model(self, request_id: str, error: Exception) -> None:
        if not self.using_fallback and self.fallback_model != self.primary_model:
            self.using_fallback = True
            self.current_model = self.fallback_model
            self.client.model = self.fallback_model
            logger.warning(f"Switched to fallback model '{self.fallback_model}' for request_id {request_id}")
            logger.warning(f"Primary model error: {error}")

    def _is_oom_error(self, error: Exception) -> bool:
        error_msg = str(error).lower()
        return any(ind in error_msg for ind in [
            "out of memory", "cuda out of memory", "insufficient memory",
            "memory allocation failed", "cannot allocate memory"
        ])

    async def _try_with_fallback(self, operation, prompt: str, request_id: str, **kwargs):
        import traceback

        try:
            return await operation(prompt, request_id, **kwargs)
        except Exception as e:
            logger.error(f"❌ Sync generation error for request_id {request_id}: {e}\n{traceback.format_exc()}")
            if self.using_fallback:
                logger.error(f"❌ Fallback sync generation failed for request_id {request_id}: {e}\n{traceback.format_exc()}")
                raise
            if self._should_fallback(e):
                self._switch_to_fallback_model(request_id, e)
                return await operation(prompt, request_id, **kwargs)
            else:
                raise
