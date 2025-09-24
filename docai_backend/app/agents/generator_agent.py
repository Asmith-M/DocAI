#docai_backend/app/agents/generator_agent.py
import asyncio
import uuid
from typing import List, Dict, Any, AsyncGenerator
from loguru import logger
from app.llm.ollama_client import get_ollama_client
from app.core.config import settings

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
        request_id: str = None
    ) -> Any:
        if not request_id:
            request_id = str(uuid.uuid4())

        logger.info(f"🤖 GeneratorAgent: Starting generation for request_id {request_id}")
        logger.info(f"📝 Question: {question}")
        logger.info(f"📊 Context chunks: {len(context_chunks)}")
        logger.info(f"🔄 Stream mode: {stream}")
        logger.info(f"🎯 Current model: {self.current_model}, Using fallback: {self.using_fallback}")

        # Limit context chunks to top N and truncate text to ~300 tokens (approx 1500 chars)
        max_chunks = int(getattr(settings, "GENERATOR_MAX_CONTEXT_CHUNKS", 5))
        truncated_chunks = []
        for chunk in context_chunks[:max_chunks]:
            text = chunk.get("text", "")
            truncated_text = text[:1500]  # Approximate truncation
            truncated_chunks.append({**chunk, "text": truncated_text})

        logger.info(f"📊 Truncated to {len(truncated_chunks)} chunks")

        prompt = self._build_prompt(question, truncated_chunks)
        logger.info(f"📝 Prompt length: {len(prompt)} characters")

        async with self.semaphore:
            logger.info(f"🔒 Acquired semaphore for request_id {request_id}")
            if stream:
                logger.info(f"📡 Starting streaming generation for request_id {request_id}")
                return self._stream_generate_with_fallback(prompt, request_id)
            else:
                logger.info(f"📝 Starting sync generation for request_id {request_id}")
                return await self._generate_sync_with_fallback(prompt, request_id)

    def _build_prompt(self, question: str, context_chunks: List[Dict[str, Any]]) -> str:
        context_text = "\n\n".join([chunk.get("text", "") for chunk in context_chunks])
        prompt = f"Context:\n{context_text}\n\nQuestion:\n{question}\n\nAnswer:"
        return self._truncate_prompt(prompt)

    def _truncate_prompt(self, prompt: str) -> str:
        """Truncate prompt to fit within context window."""
        max_chars = settings.OLLAMA_CTX * 4  # Approximate: 1 token ~ 4 characters
        if len(prompt) > max_chars:
            logger.warning(f"Prompt length {len(prompt)} exceeds context window {max_chars}, truncating")
            truncated_prompt = prompt[:max_chars]
            # Ensure we don't cut in the middle of a word
            last_space = truncated_prompt.rfind(" ")
            if last_space > max_chars * 0.9:
                truncated_prompt = truncated_prompt[:last_space]
            logger.info(f"Truncated prompt to {len(truncated_prompt)} characters")
            return truncated_prompt
        return prompt

    async def _generate_sync(self, prompt: str, request_id: str) -> str:
        try:
            logger.info(f"🔧 GeneratorAgent: Calling client.generate_async for request_id {request_id}")
            logger.info(f"📝 Prompt length: {len(prompt)} characters")

            # Add timeout to prevent hanging
            import asyncio
            try:
                result = await asyncio.wait_for(
                    self.client.generate_async(prompt),
                    timeout=120.0  # 120 second timeout for better reliability
                )
                logger.info(f"✅ GeneratorAgent: Completed generation for request_id {request_id}")
                logger.info(f"📊 Result type: {type(result)}, Result keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")

                if isinstance(result, dict):
                    response = result.get('response', '')
                    logger.info(f"📄 Response length: {len(response)} characters")
                    return response
                else:
                    logger.warning(f"⚠️ Unexpected result type: {type(result)}")
                    return str(result)
            except asyncio.TimeoutError:
                logger.error(f"⏰ GeneratorAgent: Generation timed out after 60s for request_id {request_id}")
                raise Exception("Generation timed out")
            except Exception as e:
                logger.error(f"❌ GeneratorAgent: Error during generation for request_id {request_id}: {e}")
                logger.error(f"❌ Error type: {type(e).__name__}")
                raise

        except Exception as e:
            logger.error(f"❌ GeneratorAgent: Error during generation for request_id {request_id}: {e}")
            logger.error(f"❌ Error type: {type(e).__name__}")
            raise

    async def _generate_sync_with_fallback(self, prompt: str, request_id: str) -> str:
        """Generate text with fallback model support."""
        async def operation(prompt: str, request_id: str):
            # Note: num_ctx and num_predict are not supported by the ollama Python client
            # These would need to be configured at the Ollama server level
            result = await self.client.generate_async(prompt)
            return result.get('response', '') if isinstance(result, dict) else str(result)

        return await self._try_with_fallback(operation, prompt, request_id)

    async def _stream_generate(self, prompt: str, request_id: str) -> AsyncGenerator[str, None]:
        try:
            # Remove temperature parameter as it's not supported by the Ollama client
            async for token in self.client.generate_stream_async(prompt):
                yield token
            logger.info(f"GeneratorAgent: Completed streaming generation for request_id {request_id}")
        except Exception as e:
            logger.error(f"GeneratorAgent: Error during streaming generation for request_id {request_id}: {e}")
            raise

    async def _stream_generate_with_fallback(self, prompt: str, request_id: str) -> AsyncGenerator[str, None]:
        """Generate streaming text with fallback model support."""
        async def operation(prompt: str, request_id: str):
            # Note: num_ctx and num_predict are not supported by the ollama Python client
            # These would need to be configured at the Ollama server level
            try:
                # Add timeout to prevent hanging
                async with asyncio.timeout(120.0):  # 120 second timeout for better reliability
                    async for token in self.client.generate_stream_async(prompt):
                        yield token
            except asyncio.TimeoutError:
                logger.error(f"⏰ GeneratorAgent: Streaming timed out after 120s for request_id {request_id}")
                raise Exception("Streaming timed out")

        # Use the fallback logic for streaming
        try:
            async for token in operation(prompt, request_id):
                yield token
        except Exception as e:
            logger.warning(f"GeneratorAgent: Streaming operation failed with model '{self.current_model}' for request_id {request_id}: {e}")

            # If we're already using fallback, don't try again
            if self.using_fallback:
                logger.error(f"GeneratorAgent: Fallback model '{self.current_model}' also failed for streaming request_id {request_id}")
                raise

            # Check if this is an OOM error and we should switch to fallback
            if self._is_oom_error(e):
                logger.warning(f"GeneratorAgent: Detected OOM error for streaming request_id {request_id}, switching to fallback model")
                self._switch_to_fallback_model(request_id, e)

                # Retry with fallback model
                try:
                    async for token in operation(prompt, request_id):
                        yield token
                except Exception as fallback_error:
                    logger.error(f"GeneratorAgent: Fallback model also failed for streaming request_id {request_id}: {fallback_error}")
                    raise fallback_error
            else:
                # For non-OOM errors, try fallback once
                self._switch_to_fallback_model(request_id, e)
                try:
                    async for token in operation(prompt, request_id):
                        yield token
                except Exception as fallback_error:
                    logger.error(f"GeneratorAgent: Fallback model also failed for streaming request_id {request_id}: {fallback_error}")
                    raise fallback_error

    def _switch_to_fallback_model(self, request_id: str, error: Exception) -> None:
        """Switch to fallback model if available and not already using it."""
        if not self.using_fallback and self.fallback_model != self.primary_model:
            self.using_fallback = True
            self.current_model = self.fallback_model
            logger.warning(f"GeneratorAgent: Switched to fallback model '{self.fallback_model}' for request_id {request_id}")
            logger.warning(f"GeneratorAgent: Primary model error: {error}")

    def _is_oom_error(self, error: Exception) -> bool:
        """Check if the error is likely due to out of memory."""
        error_msg = str(error).lower()
        oom_indicators = [
            "out of memory",
            "memory",
            "cuda out of memory",
            "insufficient memory",
            "memory allocation failed",
            "cannot allocate memory"
        ]
        return any(indicator in error_msg for indicator in oom_indicators)

    async def _try_with_fallback(self, operation, prompt: str, request_id: str, **kwargs):
        """Try operation with primary model, fallback to fallback model if needed."""
        try:
            # Try with current model (primary or fallback)
            return await operation(prompt, request_id, **kwargs)
        except Exception as e:
            logger.warning(f"GeneratorAgent: Operation failed with model '{self.current_model}' for request_id {request_id}: {e}")

            # If we're already using fallback, don't try again
            if self.using_fallback:
                logger.error(f"GeneratorAgent: Fallback model '{self.current_model}' also failed for request_id {request_id}")
                raise

            # Check if this is an OOM error and we should switch to fallback
            if self._is_oom_error(e):
                logger.warning(f"GeneratorAgent: Detected OOM error for request_id {request_id}, switching to fallback model")
                self._switch_to_fallback_model(request_id, e)

                # Retry with fallback model
                try:
                    return await operation(prompt, request_id, **kwargs)
                except Exception as fallback_error:
                    logger.error(f"GeneratorAgent: Fallback model also failed for request_id {request_id}: {fallback_error}")
                    raise fallback_error
            else:
                # For non-OOM errors, try fallback once
                self._switch_to_fallback_model(request_id, e)
                try:
                    return await operation(prompt, request_id, **kwargs)
                except Exception as fallback_error:
                    logger.error(f"GeneratorAgent: Fallback model also failed for request_id {request_id}: {fallback_error}")
                    raise fallback_error
