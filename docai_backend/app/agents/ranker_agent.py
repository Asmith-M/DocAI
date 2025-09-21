#docai_backend/app/agents/ranker_agent.py
import logging
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.services.embedding_service import embedding_service

log = logging.getLogger(__name__)

class RankerAgent:
    """
    Agent responsible for ranking and selecting candidate chunks for RAG.
    Uses hybrid approach: lexical (TF-IDF) + semantic (cosine) reranking with MMR.
    """

    def __init__(self, max_candidates: int = 20, final_candidates: int = 5):
        self.max_candidates = max_candidates
        self.final_candidates = final_candidates
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=10000
        )

    async def get_candidates(self, document_id: str, question: str, top_k: int = 10, return_top: int = 5) -> Dict[str, Any]:
        """
        Get top candidate chunks using hybrid ranking approach.

        Args:
            document_id: Document ID to search in
            question: User query string
            top_k: Number of initial candidates to retrieve
            return_top: Number of final candidates to return

        Returns:
            Dict containing candidate chunks with scores and metadata
        """
        try:
            # Step 1: Get initial candidates from embedding search (semantic)
            # Check if search_similar is async or sync
            if hasattr(embedding_service.search_similar, '__call__'):
                try:
                    # Try async first
                    initial_candidates = await embedding_service.search_similar(
                        document_id, question, n_results=self.max_candidates
                    )
                except TypeError:
                    # If that fails, try sync
                    initial_candidates = embedding_service.search_similar(
                        document_id, question, n_results=self.max_candidates
                    )
            else:
                initial_candidates = embedding_service.search_similar(
                    document_id, question, n_results=self.max_candidates
                )

            if not initial_candidates.get('results'):
                log.warning(f"No candidates found for query: {question}")
                return {"chunks": []}

            candidates = initial_candidates['results']

            # Step 2: Compute lexical scores (TF-IDF similarity)
            lexical_scores = self._compute_lexical_scores(question, candidates)

            # Step 3: Combine semantic and lexical scores
            combined_candidates = self._combine_scores(candidates, lexical_scores)

            # Step 4: Apply MMR (Maximal Marginal Relevance) for diversity
            final_candidates = self._apply_mmr(question, combined_candidates, return_top)

            log.info(f"Selected {len(final_candidates)} candidates for query: {question}")
            return {"chunks": final_candidates}

        except Exception as e:
            log.error(f"Error in RankerAgent.get_candidates: {e}")
            return {"chunks": []}

    def _compute_lexical_scores(self, query: str, candidates: List[Dict[str, Any]]) -> List[float]:
        """Compute lexical similarity scores using TF-IDF."""
        try:
            if not candidates:
                return []

            # Extract candidate texts
            candidate_texts = [c.get('text', '') for c in candidates]

            # Add query to corpus for vectorization
            corpus = [query] + candidate_texts

            # Fit and transform
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(corpus)

            # Compute cosine similarity between query and candidates
            query_vector = tfidf_matrix[0]
            candidate_vectors = tfidf_matrix[1:]

            similarities = cosine_similarity(query_vector, candidate_vectors)[0]

            return similarities.tolist()

        except Exception as e:
            log.warning(f"Error computing lexical scores: {e}")
            return [0.0] * len(candidates)

    def _combine_scores(self, candidates: List[Dict[str, Any]], lexical_scores: List[float]) -> List[Dict[str, Any]]:
        """Combine semantic and lexical scores."""
        combined = []

        for i, candidate in enumerate(candidates):
            semantic_score = candidate.get('distance', 0.5)
            # Convert distance to similarity (lower distance = higher similarity)
            semantic_similarity = 1.0 - semantic_score

            lexical_score = lexical_scores[i] if i < len(lexical_scores) else 0.0

            # Weighted combination (60% semantic, 40% lexical)
            combined_score = 0.6 * semantic_similarity + 0.4 * lexical_score

            combined.append({
                **candidate,
                'combined_score': combined_score,
                'semantic_score': semantic_similarity,
                'lexical_score': lexical_score
            })

        # Sort by combined score (descending)
        combined.sort(key=lambda x: x['combined_score'], reverse=True)
        return combined

    def _apply_mmr(self, query: str, candidates: List[Dict[str, Any]], n_results: int, lambda_param: float = 0.5) -> List[Dict[str, Any]]:
        """
        Apply Maximal Marginal Relevance (MMR) for diversity.

        Args:
            query: Original query
            candidates: Ranked candidates with scores
            n_results: Number of results to return
            lambda_param: Balance between relevance (1.0) and diversity (0.0)
        """
        if not candidates:
            return []

        selected = []
        remaining = candidates.copy()

        # Select first candidate (highest relevance)
        if remaining:
            selected.append(remaining.pop(0))

        while len(selected) < min(n_results, len(candidates)):
            if not remaining:
                break

            best_score = -1
            best_idx = -1

            for i, candidate in enumerate(remaining):
                # Relevance score
                relevance = candidate['combined_score']

                # Diversity score (max similarity to already selected)
                diversity = 0.0
                if selected:
                    similarities = []
                    for selected_cand in selected:
                        sim = self._compute_text_similarity(
                            candidate.get('text', ''),
                            selected_cand.get('text', '')
                        )
                        similarities.append(sim)
                    diversity = max(similarities) if similarities else 0.0

                # MMR score
                mmr_score = lambda_param * relevance - (1 - lambda_param) * diversity

                if mmr_score > best_score:
                    best_score = mmr_score
                    best_idx = i

            if best_idx >= 0:
                selected.append(remaining.pop(best_idx))
            else:
                break

        return selected

    def _compute_text_similarity(self, text1: str, text2: str) -> float:
        """Compute simple text similarity for MMR diversity."""
        try:
            if not text1 or not text2:
                return 0.0

            # Simple Jaccard similarity on words
            words1 = set(text1.lower().split())
            words2 = set(text2.lower().split())

            intersection = words1.intersection(words2)
            union = words1.union(words2)

            if not union:
                return 0.0

            return len(intersection) / len(union)

        except Exception:
            return 0.0

# Global instance
ranker_agent = RankerAgent()