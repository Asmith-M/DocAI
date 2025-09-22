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
        self.model = settings.OLLAMA_MODEL
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

        # Limit context chunks to top N and truncate text to ~300 tokens (approx 1500 chars)
        max_chunks = int(getattr(settings, "GENERATOR_MAX_CONTEXT_CHUNKS", 5))
        truncated_chunks = []
        for chunk in context_chunks[:max_chunks]:
            text = chunk.get("text", "")
            truncated_text = text[:1500]  # Approximate truncation
            truncated_chunks.append({**chunk, "text": truncated_text})

        prompt = self._build_prompt(question, truncated_chunks)

        logger.info(f"GeneratorAgent: Starting generation for request_id {request_id}")

        async with self.semaphore:
            if stream:
                return self._stream_generate(prompt, request_id)
            else:
                return await self._generate_sync(prompt, request_id)

    def _build_prompt(self, question: str, context_chunks: List[Dict[str, Any]]) -> str:
        context_text = "\n\n".join([chunk.get("text", "") for chunk in context_chunks])
        prompt = f"Context:\n{context_text}\n\nQuestion:\n{question}\n\nAnswer:"
        return prompt

    async def _generate_sync(self, prompt: str, request_id: str) -> str:
        try:
            # Remove temperature parameter as it's not supported by the Ollama client
            result = await self.client.generate_async(prompt)
            logger.info(f"GeneratorAgent: Completed generation for request_id {request_id}")
            return result.get('response', '') if isinstance(result, dict) else str(result)
        except Exception as e:
            logger.error(f"GeneratorAgent: Error during generation for request_id {request_id}: {e}")
            raise

    async def _stream_generate(self, prompt: str, request_id: str) -> AsyncGenerator[str, None]:
        try:
            # Remove temperature parameter as it's not supported by the Ollama client
            async for token in self.client.generate_stream_async(prompt):
                yield token
            logger.info(f"GeneratorAgent: Completed streaming generation for request_id {request_id}")
        except Exception as e:
            logger.error(f"GeneratorAgent: Error during streaming generation for request_id {request_id}: {e}")
            raise