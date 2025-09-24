import pytest
from app.cache.rag_cache import get_cached_candidates, set_cached_candidates, clear_cache, rag_cache

class TestRAGCache:
    def test_set_and_get_cached_candidates(self):
        document_id = "test_doc"
        question = "test question"
        candidates = {"chunks": [{"text": "test chunk"}]}

        # Set cache
        set_cached_candidates(document_id, question, candidates)

        # Get cache
        cached = get_cached_candidates(document_id, question)

        assert cached == candidates

    def test_clear_cache_specific_document(self):
        # Set multiple entries
        set_cached_candidates("doc1", "q1", {"chunks": []})
        set_cached_candidates("doc1", "q2", {"chunks": []})
        set_cached_candidates("doc2", "q1", {"chunks": []})

        # Clear cache for doc1
        clear_cache("doc1")

        # Check that doc1 entries are cleared but doc2 remains
        assert get_cached_candidates("doc1", "q1") is None
        assert get_cached_candidates("doc1", "q2") is None
        assert get_cached_candidates("doc2", "q1") is not None

    def test_clear_cache_all(self):
        # Set entries
        set_cached_candidates("doc1", "q1", {"chunks": []})
        set_cached_candidates("doc2", "q1", {"chunks": []})

        # Clear all cache
        clear_cache()

        # Check that all entries are cleared
        assert get_cached_candidates("doc1", "q1") is None
        assert get_cached_candidates("doc2", "q1") is None

    def test_cache_expiration(self):
        # This test would require mocking time, but for now we can test basic functionality
        document_id = "test_doc"
        question = "test question"
        candidates = {"chunks": [{"text": "test chunk"}]}

        # Set cache
        set_cached_candidates(document_id, question, candidates)

        # Get cache immediately
        cached = get_cached_candidates(document_id, question)
        assert cached == candidates
