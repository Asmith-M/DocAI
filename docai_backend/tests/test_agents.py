import pytest
from unittest.mock import Mock, patch
from app.agents.chunk_agent import ChunkAgent
from app.agents.ranker_agent import RankerAgent
from app.agents.generator_agent import GeneratorAgent
from app.agents.verifier_placeholder import VerifierAgent

class TestChunkAgent:
    def test_create_chunks(self):
        agent = ChunkAgent()
        parsed_pages = [
            {"page": 1, "text": "This is a test document.", "tables": []}
        ]
        chunks = agent.create_chunks("test_doc", parsed_pages)
        assert len(chunks) > 0
        assert all("text" in chunk for chunk in chunks)

class TestRankerAgent:
    def test_get_candidates(self):
        agent = RankerAgent()
        with patch('app.services.embedding_service.embedding_service.search_similar') as mock_search:
            mock_search.return_value = {
                'results': [
                    {'text': 'Test chunk', 'distance': 0.1, 'metadata': {}}
                ]
            }
            candidates = agent.get_candidates("test query", "test_doc")
            assert len(candidates) > 0

class TestGeneratorAgent:
    @pytest.mark.asyncio
    async def test_generate(self):
        agent = GeneratorAgent()
        context_chunks = [{"text": "Test context"}]
        with patch.object(agent.client, 'generate', return_value="Test response"):
            result = await agent.generate("test query", context_chunks, stream=False)
            assert result == "Test response"

class TestVerifierAgent:
    def test_placeholder_verify(self):
        agent = VerifierAgent()
        result = agent.placeholder_verify("test answer", [{"text": "test source"}], [{"text": "test source"}])
        assert "verification_flag" in result
        assert result["verification_flag"] in ["verified", "unverified"]
