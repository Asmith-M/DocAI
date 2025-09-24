import pytest
from unittest.mock import Mock, patch, AsyncMock
from app.orchestrator.rag_orchestrator import RAGOrchestrator

class TestRAGOrchestrator:
    @pytest.fixture
    def orchestrator(self):
        return RAGOrchestrator()

    @pytest.mark.asyncio
    async def test_handle_query_non_streaming(self, orchestrator):
        with patch.object(orchestrator.ranker_agent, 'get_candidates', new_callable=AsyncMock) as mock_ranker, \
             patch.object(orchestrator.generator_agent, 'generate', new_callable=AsyncMock) as mock_generator, \
             patch.object(orchestrator.verifier_agent, 'placeholder_verify') as mock_verifier:

            mock_ranker.return_value = {"chunks": [{"text": "test chunk"}]}
            mock_generator.return_value = "Test answer"
            mock_verifier.return_value = {"verification_flag": "verified"}

            result = await orchestrator.handle_query("test_doc", "test question", stream=False)

            assert "answer" in result
            assert "sources" in result
            assert "verification_flag" in result
            assert "timings_ms" in result
            assert result["answer"] == "Test answer"

    @pytest.mark.asyncio
    async def test_handle_query_streaming(self, orchestrator):
        with patch.object(orchestrator.ranker_agent, 'get_candidates', new_callable=AsyncMock) as mock_ranker, \
             patch.object(orchestrator.generator_agent, 'generate', new_callable=AsyncMock) as mock_generator, \
             patch.object(orchestrator.verifier_agent, 'placeholder_verify') as mock_verifier:

            mock_ranker.return_value = {"chunks": [{"text": "test chunk"}]}
            mock_generator.return_value = (token for token in ["T", "e", "s", "t"])
            mock_verifier.return_value = {"verification_flag": "verified"}

            # Test that streaming returns an async generator
            result = await orchestrator.handle_query("test_doc", "test question", stream=True)
            assert hasattr(result, '__aiter__')  # Check if it's an async generator
