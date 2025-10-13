#docai_backend/app/agents/generator_agent.py
import asyncio
import uuid
import logging
from typing import List, Dict, Any, AsyncGenerator
from loguru import logger
from app.llm.ollama_client import get_ollama_client
from app.core.config import settings

# Check if Ollama client is available
try:
    client = get_ollama_client()
    # Test client availability
    asyncio.run(client.generate_async("test"))
    logger.info("Ollama client initialized successfully")
except Exception as e:
    logger.warning(f"Ollama client not available: {e}")
    client = None
from enum import Enum, auto

log = logging.getLogger(__name__)

class GeneratorAgent:
    """
    Agent responsible for generating answers using Ollama with streaming support.
    """

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
                async for token in self._stream_generate_with_fallback(prompt, request_id):
                    yield token
            else:
                logger.info(f"📝 Starting sync generation for request_id {request_id}")
                result = await self._generate_sync_with_fallback(prompt, request_id)
                yield result

    def _build_prompt(self, question: str, context_chunks: List[Dict[str, Any]], language: str = "en") -> str:
        """
        Build a structured prompt with dynamic system prompt including language instruction.
        """
        if not context_chunks:
            logger.warning("⚠️ No context chunks provided, using simple fallback prompt")
            return f"Question:\n{question}\n\nAnswer:"

        # Dynamic system prompt with language instruction
        if language == "en":
            system_prompt = (
                "You are a helpful AI assistant. Answer the question based on the provided context. "
                "Be concise and accurate."
            )
        else:
            system_prompt = (
                f"You are a helpful AI assistant. Answer the question based on the provided context. "
                f"The user's query is in {language.upper()}. Please provide your final answer in {language.upper()}. "
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

        # Add explicit instruction to answer in the detected language
        language_instruction = f"\n\nImportant: The user's query is in {language}. You must provide your final answer in {language} only."

        # Final structured prompt
        prompt = f"""{system_prompt}

Context:
{context_text}

Question: {question}

Answer:{language_instruction}
"""

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

# Global instance
generator_agent = GeneratorAgent()
