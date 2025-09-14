import asyncio
import logging
import hashlib
import json
import time
from typing import List, Dict, Any, Optional, AsyncGenerator
from datetime import datetime, timedelta
from app.agents.ranker_agent import ranker_agent
from app.agents.generator_agent import generator_agent
from app.agents.verifier_agent import verifier_agent
from app.services.embedding_service import embedding_service

log = logging.getLogger(__name__)

class RAGMetrics:
    """Simple metrics collection for RAG operations."""

    def __init__(self):
        self.query_count = 0
        self.cache_hits = 0
        self.cache_misses = 0
        self.total_query_time = 0.0
        self.total_retrieval_time = 0.0
        self.total_generation_time = 0.0
        self.total_verification_time = 0.0
        self.error_count = 0

    def record_query(self, duration: float, cached: bool = False):
        """Record a query execution."""
        self.query_count += 1
        self.total_query_time += duration
        if cached:
            self.cache_hits += 1
        else:
            self.cache_misses += 1

    def record_retrieval_time(self, duration: float):
        """Record retrieval operation time."""
        self.total_retrieval_time += duration

    def record_generation_time(self, duration: float):
        """Record generation operation time."""
        self.total_generation_time += duration

    def record_verification_time(self, duration: float):
        """Record verification operation time."""
        self.total_verification_time += duration

    def record_error(self):
        """Record an error."""
        self.error_count += 1

    def get_stats(self) -> Dict[str, Any]:
        """Get current metrics statistics."""
        avg_query_time = self.total_query_time / self.query_count if self.query_count > 0 else 0
        cache_hit_rate = self.cache_hits / self.query_count if self.query_count > 0 else 0

        return {
            'total_queries': self.query_count,
            'cache_hit_rate': cache_hit_rate,
            'avg_query_time': avg_query_time,
            'total_errors': self.error_count,
            'avg_retrieval_time': self.total_retrieval_time / self.query_count if self.query_count > 0 else 0,
            'avg_generation_time': self.total_generation_time / self.query_count if self.query_count > 0 else 0,
            'avg_verification_time': self.total_verification_time / self.query_count if self.query_count > 0 else 0,
        }

# Global metrics instance
rag_metrics = RAGMetrics()

class RAGService:
    """
    Service that orchestrates the complete RAG pipeline with caching and prefetching.
    """

    def __init__(self):
        self.cache = {}  # Simple in-memory cache
        self.cache_ttl = timedelta(hours=1)  # Cache for 1 hour
        self.prefetch_queue = asyncio.Queue()

    async def query(
        self,
        query: str,
        document_id: str,
        stream: bool = True,
        use_cache: bool = True
    ) -> AsyncGenerator[str, None]:
        """
        Execute a complete RAG query with streaming response.

        Args:
            query: User query string
            document_id: Document ID to search in
            stream: Whether to stream the response
            use_cache: Whether to use cached results

        Yields:
            Response chunks as they are generated
        """
        start_time = time.time()
        query_logged = False

        try:
            # Check cache first
            cache_key = self._generate_cache_key(query, document_id)
            cached_result = self._get_cached_result(cache_key) if use_cache else None

            if cached_result:
                log.info(f"Cache hit for query: '{query}' on document: {document_id}")
                rag_metrics.record_query(time.time() - start_time, cached=True)
                async for chunk in self._stream_cached_result(cached_result):
                    yield chunk
                return

            log.info(f"Processing new query: '{query}' on document: {document_id}")
            query_logged = True

            # Step 1: Retrieve and rank candidates
            retrieval_start = time.time()
            candidates = ranker_agent.get_candidates(query, document_id, n_results=5)
            retrieval_time = time.time() - retrieval_start
            rag_metrics.record_retrieval_time(retrieval_time)

            log.info(f"Retrieved {len(candidates)} candidates in {retrieval_time:.3f}s")

            if not candidates:
                log.warning(f"No candidates found for query: '{query}' on document: {document_id}")
                rag_metrics.record_query(time.time() - start_time, cached=False)
                yield "I couldn't find relevant information in the document to answer your question."
                return

            # Step 2: Generate answer using retrieved context
            generation_start = time.time()
            full_answer = ""
            async for chunk in generator_agent.generate_answer(query, candidates, stream=stream):
                full_answer += chunk
                yield chunk
            generation_time = time.time() - generation_start
            rag_metrics.record_generation_time(generation_time)

            log.info(f"Generated answer ({len(full_answer)} chars) in {generation_time:.3f}s")

            # Step 3: Verify the answer
            verification_start = time.time()
            verification = verifier_agent.verify_answer(query, full_answer, candidates)
            verification_time = time.time() - verification_start
            rag_metrics.record_verification_time(verification_time)

            log.info(f"Verification completed in {verification_time:.3f}s - Confidence: {verification.get('confidence_level', 'unknown')}")

            # Step 4: Cache the result
            if use_cache:
                cache_entry = {
                    'answer': full_answer,
                    'candidates': candidates,
                    'verification': verification,
                    'timestamp': datetime.now()
                }
                self._cache_result(cache_key, cache_entry)

            # Log the query for potential prefetching
            await self._log_query_for_prefetch(query, document_id, candidates)

            # Record successful query metrics
            total_time = time.time() - start_time
            rag_metrics.record_query(total_time, cached=False)
            log.info(f"Query completed successfully in {total_time:.3f}s")

        except Exception as e:
            # Record error metrics
            rag_metrics.record_error()
            total_time = time.time() - start_time

            if not query_logged:
                log.error(f"Query failed: '{query}' on document: {document_id} - Error: {e}")
            else:
                log.error(f"Query processing failed after {total_time:.3f}s - Error: {e}")

            yield f"An error occurred while processing your query: {str(e)}"

    async def get_streaming_response(
        self,
        query: str,
        document_id: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Get a streaming response with metadata for the frontend.

        Args:
            query: User query
            document_id: Document ID

        Yields:
            Dictionaries containing response chunks and metadata
        """
        try:
            # Get candidates first (for metadata)
            candidates = ranker_agent.get_candidates(query, document_id, n_results=5)

            # Yield metadata first
            yield {
                'type': 'metadata',
                'candidates_count': len(candidates),
                'sources': [
                    {
                        'page': c.get('metadata', {}).get('page'),
                        'chunk_index': c.get('metadata', {}).get('chunk_index'),
                        'text_preview': c.get('text', '')[:100] + '...'
                    } for c in candidates[:3]  # Top 3 sources
                ]
            }

            # Stream the answer
            full_answer = ""
            async for chunk in generator_agent.generate_answer(query, candidates, stream=True):
                full_answer += chunk
                yield {
                    'type': 'chunk',
                    'content': chunk
                }

            # Yield verification results
            verification = verifier_agent.verify_answer(query, full_answer, candidates)
            yield {
                'type': 'verification',
                'confidence_score': verification['confidence_score'],
                'confidence_level': verification['confidence_level'],
                'hallucination_risk': verification['hallucination_risk']
            }

        except Exception as e:
            log.error(f"Error in RAGService.get_streaming_response: {e}")
            yield {
                'type': 'error',
                'message': str(e)
            }

    def prefetch_related_queries(self, document_id: str, current_query: str):
        """
        Prefetch related queries to improve response times.

        Args:
            document_id: Document ID
            current_query: Current user query
        """
        try:
            # Generate related queries based on current query
            related_queries = self._generate_related_queries(current_query)

            # Add to prefetch queue
            for query in related_queries:
                asyncio.create_task(self._prefetch_query(query, document_id))

        except Exception as e:
            log.warning(f"Error in prefetch_related_queries: {e}")

    async def _prefetch_query(self, query: str, document_id: str):
        """Prefetch a single query in the background."""
        try:
            # Get candidates and cache them
            candidates = ranker_agent.get_candidates(query, document_id, n_results=5)

            # Generate answer and cache
            full_answer = ""
            async for chunk in generator_agent.generate_answer(query, candidates, stream=False):
                full_answer += chunk

            # Cache the result
            cache_key = self._generate_cache_key(query, document_id)
            cache_entry = {
                'answer': full_answer,
                'candidates': candidates,
                'verification': verifier_agent.verify_answer(query, full_answer, candidates),
                'timestamp': datetime.now(),
                'prefetched': True
            }
            self._cache_result(cache_key, cache_entry)

            log.info(f"Prefetched query: {query}")

        except Exception as e:
            log.warning(f"Error prefetching query '{query}': {e}")

    def _generate_related_queries(self, query: str) -> List[str]:
        """Generate related queries for prefetching."""
        # Simple query expansion - in a real system this could use NLP
        words = query.lower().split()
        related = []

        # Add some common follow-up patterns
        if len(words) > 2:
            related.extend([
                f"What is {query}?",
                f"Explain {query}",
                f"How does {query} work?",
                f"Tell me more about {query}"
            ])

        return related[:3]  # Limit to 3 related queries

    def _generate_cache_key(self, query: str, document_id: str) -> str:
        """Generate a cache key for the query."""
        content = f"{query}:{document_id}".lower().strip()
        return hashlib.md5(content.encode()).hexdigest()

    def _get_cached_result(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached result if it exists and is not expired."""
        if cache_key in self.cache:
            entry = self.cache[cache_key]
            if datetime.now() - entry['timestamp'] < self.cache_ttl:
                return entry
            else:
                # Remove expired entry
                del self.cache[cache_key]
        return None

    def _cache_result(self, cache_key: str, result: Dict[str, Any]):
        """Cache a result."""
        self.cache[cache_key] = result

        # Simple cache size management
        if len(self.cache) > 1000:  # Max 1000 entries
            # Remove oldest entries
            sorted_entries = sorted(self.cache.items(), key=lambda x: x[1]['timestamp'])
            for old_key, _ in sorted_entries[:100]:  # Remove 100 oldest
                del self.cache[old_key]

    async def _stream_cached_result(self, cached_result: Dict[str, Any]) -> AsyncGenerator[str, None]:
        """Stream a cached result."""
        answer = cached_result.get('answer', '')
        # Stream in chunks to simulate real streaming
        chunk_size = 50
        for i in range(0, len(answer), chunk_size):
            yield answer[i:i + chunk_size]
            await asyncio.sleep(0.01)  # Small delay to simulate streaming

    async def _log_query_for_prefetch(self, query: str, document_id: str, candidates: List[Dict[str, Any]]):
        """Log query information for potential prefetching."""
        # In a real system, this could log to a database for analysis
        # For now, just trigger prefetching for the current document
        self.prefetch_related_queries(document_id, query)

    def clear_cache(self, document_id: Optional[str] = None):
        """
        Clear cache entries.

        Args:
            document_id: If provided, only clear cache for this document
        """
        if document_id:
            # Remove entries containing this document_id
            keys_to_remove = []
            for key, entry in self.cache.items():
                # Check if this cache entry is for the document
                # This is a simple check - in production you'd want better tracking
                if document_id in key:
                    keys_to_remove.append(key)
            for key in keys_to_remove:
                del self.cache[key]
        else:
            self.cache.clear()

        log.info(f"Cleared cache{' for document ' + document_id if document_id else ''}")

# Global instance
rag_service = RAGService()
