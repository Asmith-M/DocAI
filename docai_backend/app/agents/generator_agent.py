import logging
import json
import asyncio
from typing import List, Dict, Any, AsyncGenerator, Optional
import aiohttp
from app.core.config import settings

log = logging.getLogger(__name__)

class GeneratorAgent:
    """
    Agent responsible for generating answers using Ollama with streaming support.
    """

    def __init__(self):
        self.ollama_host = settings.OLLAMA_HOST
        self.model = settings.OLLAMA_MODEL
        self.timeout = aiohttp.ClientTimeout(total=300)  # 5 minutes timeout

    async def generate_answer(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        stream: bool = True
    ) -> AsyncGenerator[str, None]:
        """
        Generate an answer using Ollama with context from retrieved chunks.

        Args:
            query: User query
            context_chunks: List of relevant document chunks
            stream: Whether to stream the response

        Yields:
            Response chunks as they are generated
        """
        try:
            # Prepare context from chunks
            context = self._prepare_context(context_chunks)

            # Create prompt
            prompt = self._create_prompt(query, context)

            # Generate response
            async for chunk in self._call_ollama(prompt, stream=stream):
                yield chunk

        except Exception as e:
            log.error(f"Error in GeneratorAgent.generate_answer: {e}")
            yield f"Error generating answer: {str(e)}"

    def _prepare_context(self, chunks: List[Dict[str, Any]]) -> str:
        """Prepare context string from retrieved chunks."""
        if not chunks:
            return "No relevant context found."

        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            text = chunk.get('text', '').strip()
            metadata = chunk.get('metadata', {})

            # Add source information
            source_info = []
            if metadata.get('page'):
                source_info.append(f"Page {metadata['page']}")
            if metadata.get('chunk_index') is not None:
                source_info.append(f"Chunk {metadata['chunk_index']}")

            source_str = f" (Source: {', '.join(source_info)})" if source_info else ""

            context_parts.append(f"[Context {i}]{source_str}\n{text}\n")

        return "\n".join(context_parts)

    def _create_prompt(self, query: str, context: str) -> str:
        """Create a comprehensive prompt for the LLM."""
        return f"""You are a helpful AI assistant that answers questions based on the provided document context.

CONTEXT:
{context}

QUESTION: {query}

INSTRUCTIONS:
1. Answer the question using ONLY the information from the provided context
2. If the context doesn't contain enough information to answer the question, say so clearly
3. Be concise but comprehensive in your answer
4. Include specific references to sources when relevant (e.g., "According to page X...")
5. If there are multiple relevant pieces of information, synthesize them coherently
6. Maintain a professional and helpful tone

ANSWER:"""

    async def _call_ollama(self, prompt: str, stream: bool = True) -> AsyncGenerator[str, None]:
        """Call Ollama API with streaming support."""
        url = f"{self.ollama_host}/api/generate"

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": stream,
            "options": {
                "temperature": 0.1,  # Low temperature for factual responses
                "top_p": 0.9,
                "top_k": 40,
                "num_predict": 1024,  # Reasonable response length
            }
        }

        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(url, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        yield f"Error: Ollama API returned status {response.status}: {error_text}"
                        return

                    if stream:
                        # Handle streaming response
                        async for line in response.content:
                            line = line.decode('utf-8').strip()
                            if line:
                                try:
                                    data = json.loads(line)
                                    if 'response' in data:
                                        yield data['response']
                                    if data.get('done', False):
                                        break
                                except json.JSONDecodeError:
                                    continue
                    else:
                        # Handle non-streaming response
                        result = await response.json()
                        yield result.get('response', 'No response generated')

        except asyncio.TimeoutError:
            yield "Error: Request timed out. The model may be busy or unavailable."
        except aiohttp.ClientError as e:
            yield f"Error: Could not connect to Ollama at {self.ollama_host}. Make sure Ollama is running. Details: {str(e)}"
        except Exception as e:
            log.error(f"Unexpected error calling Ollama: {e}")
            yield f"Error: Unexpected error occurred: {str(e)}"

    async def check_ollama_health(self) -> Dict[str, Any]:
        """Check if Ollama is running and model is available."""
        try:
            url = f"{self.ollama_host}/api/tags"
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        models = data.get('models', [])
                        model_names = [m['name'] for m in models]

                        return {
                            'status': 'healthy',
                            'available_models': model_names,
                            'target_model_available': self.model in model_names
                        }
                    else:
                        return {
                            'status': 'unhealthy',
                            'error': f'HTTP {response.status}'
                        }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e)
            }

# Global instance
generator_agent = GeneratorAgent()
