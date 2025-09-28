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
        self.tfidf_vectorizer = None
        self.document_tfidf_matrix = {}
        self.document_candidate_texts = {}

    async def get_candidates(self, document_id: str, question: str, top_k: int = 10, return_top: int = 5, lang: str = None) -> Dict[str, Any]:
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
            log.info(f"🔍 RankerAgent: Starting candidate retrieval for doc {document_id}")
            log.info(f"📝 Query: {question}")
            log.info(f"⚙️ Parameters: top_k={top_k}, return_top={return_top}, max_candidates={self.max_candidates}")

            # Step 1: Ensure embeddings exist for the document
            log.info(f"🔍 Step 1: Checking embeddings for document {document_id}")
            embeddings_available = embedding_service.ensure_embeddings_exist(document_id)

            if not embeddings_available:
                log.warning(f"⚠️ Embeddings not available for document {document_id}, falling back to lexical search")
                return await self._lexical_fallback(document_id, question, return_top)

            # Step 2: Get initial candidates from embedding search (semantic)
            log.info(f"🔍 Step 2: Getting initial candidates from embedding service")
            if hasattr(embedding_service.search_similar, '__call__'):
                try:
                    initial_candidates = await embedding_service.search_similar(
                        document_id, question, n_results=self.max_candidates, lang=lang
                    )
                    log.info(f"✅ Called async embedding_service.search_similar")
                except TypeError:
                    initial_candidates = embedding_service.search_similar(
                        document_id, question, n_results=self.max_candidates, lang=lang
                    )
                    log.info(f"✅ Called sync embedding_service.search_similar")
            else:
                initial_candidates = embedding_service.search_similar(
                    document_id, question, n_results=self.max_candidates, lang=lang
                )
                log.info(f"✅ Called embedding_service.search_similar")

            log.info(f"📊 Initial candidates result type: {type(initial_candidates)}")
            log.info(f"📊 Initial candidates keys: {initial_candidates.keys() if isinstance(initial_candidates, dict) else 'Not a dict'}")

            if not initial_candidates.get('results'):
                log.warning(f"⚠️ No candidates found for query: {question}")
                return {"chunks": []}

            candidates = initial_candidates['results']
            log.info(f"📊 Found {len(candidates)} initial candidates")

            # Step 2: Compute lexical scores (TF-IDF similarity)
            log.info(f"🔍 Step 2: Computing lexical scores (TF-IDF)")
            lexical_scores = self._compute_lexical_scores(document_id, question, candidates)
            log.info(f"✅ Computed lexical scores: {len(lexical_scores)} scores")

            # Step 3: Combine semantic and lexical scores
            log.info(f"🔍 Step 3: Combining semantic and lexical scores")
            combined_candidates = self._combine_scores(candidates, lexical_scores)
            log.info(f"✅ Combined {len(combined_candidates)} candidates")

            # Step 4: Apply MMR (Maximal Marginal Relevance) for diversity
            log.info(f"🔍 Step 4: Applying MMR for diversity (lambda=0.5)")
            final_candidates = self._apply_mmr(question, combined_candidates, return_top)
            log.info(f"✅ Selected {len(final_candidates)} final candidates")

            # Log details about final candidates
            for i, candidate in enumerate(final_candidates):
                log.info(f"🏆 Final candidate {i+1}: score={candidate.get('combined_score', 0):.3f}, "
                        f"text_length={len(candidate.get('text', ''))}, "
                        f"semantic={candidate.get('semantic_score', 0):.3f}, "
                        f"lexical={candidate.get('lexical_score', 0):.3f}")

            return {"chunks": final_candidates}

        except Exception as e:
            log.error(f"❌ Error in RankerAgent.get_candidates: {e}")
            log.error(f"❌ Error type: {type(e).__name__}")
            return {"chunks": []}

    def _compute_lexical_scores(self, document_id: str, query: str, candidates: List[Dict[str, Any]]) -> List[float]:
        """Compute lexical similarity scores using pre-fitted TF-IDF."""
        try:
            if not candidates:
                return []

            # Extract candidate texts
            candidate_texts = [c.get('text', '') for c in candidates]

            # Check if we have pre-fitted TF-IDF for this document
            if document_id not in self.document_tfidf_matrix:
                # Fit TF-IDF on all candidate texts for this document and cache
                self.tfidf_vectorizer = TfidfVectorizer(
                    stop_words='english',
                    ngram_range=(1, 2),
                    max_features=10000
                )
                corpus = candidate_texts
                tfidf_matrix = self.tfidf_vectorizer.fit_transform(corpus)
                self.document_tfidf_matrix[document_id] = tfidf_matrix
                self.document_candidate_texts[document_id] = candidate_texts
            else:
                tfidf_matrix = self.document_tfidf_matrix[document_id]
                candidate_texts = self.document_candidate_texts[document_id]

            # Transform query
            query_vector = self.tfidf_vectorizer.transform([query])

            # Compute cosine similarity between query and candidates
            similarities = cosine_similarity(query_vector, tfidf_matrix)[0]

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

    async def _lexical_fallback(self, document_id: str, question: str, n_results: int) -> Dict[str, Any]:
        """
        Fallback method when embeddings are not available.
        Uses pure lexical search (TF-IDF) to find relevant chunks.
        """
        try:
            log.info(f"🔍 RankerAgent: Using lexical fallback for document {document_id}")

            # Load chunks for the document
            chunks = embedding_service._load_chunks(document_id)
            if not chunks:
                log.warning(f"⚠️ No chunks found for document {document_id} in lexical fallback")
                return {"chunks": []}

            # Extract texts and create candidate list
            candidates = []
            for chunk in chunks:
                text = chunk.get("text", "").strip()
                if text:  # Only include non-empty chunks
                    candidates.append({
                        "text": text,
                        "metadata": {
                            "document_id": chunk.get("document_id"),
                            "page": chunk.get("page"),
                            "chunk_index": chunk.get("chunk_index"),
                            "type": chunk.get("type"),
                            "extraction_method": chunk.get("extraction_method"),
                            "created_at": chunk.get("created_at")
                        }
                    })

            if not candidates:
                log.warning(f"⚠️ No valid chunks found for document {document_id} in lexical fallback")
                return {"chunks": []}

            log.info(f"📊 Found {len(candidates)} chunks for lexical search")

            # Compute lexical scores
            lexical_scores = self._compute_lexical_scores(document_id, question, candidates)

            # Create candidates with scores
            scored_candidates = []
            for i, candidate in enumerate(candidates):
                lexical_score = lexical_scores[i] if i < len(lexical_scores) else 0.0
                scored_candidates.append({
                    **candidate,
                    "combined_score": lexical_score,  # Use lexical score as combined score
                    "lexical_score": lexical_score,
                    "semantic_score": 0.0  # No semantic score available
                })

            # Sort by lexical score and take top n_results
            scored_candidates.sort(key=lambda x: x['combined_score'], reverse=True)
            final_candidates = scored_candidates[:n_results]

            log.info(f"✅ Lexical fallback found {len(final_candidates)} candidates")

            # Log details about final candidates
            for i, candidate in enumerate(final_candidates):
                log.info(f"🏆 Lexical candidate {i+1}: score={candidate.get('combined_score', 0):.3f}, "
                        f"text_length={len(candidate.get('text', ''))}")

            return {"chunks": final_candidates}

        except Exception as e:
            log.error(f"❌ Error in RankerAgent lexical fallback: {e}")
            return {"chunks": []}

# Global instance
ranker_agent = RankerAgent()
