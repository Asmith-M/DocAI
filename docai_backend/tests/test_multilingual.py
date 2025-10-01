import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from app.agents.language_detect_agent import language_detect_agent
from app.agents.translator_agent import translator_agent
from app.orchestrator.multilang_orchestrator import MultilangOrchestrator
from app.orchestrator.rag_orchestrator import RAGOrchestrator
from app.services.embedding_service import embedding_service


class TestLanguageDetection:
    """Test language detection functionality"""
    
    def test_detect_english(self):
        """Test detection of English text"""
        text = "This is a sample English text for testing."
        detected = language_detect_agent.detect_lang(text)
        assert detected == "en"
    
    def test_detect_empty_text(self):
        """Test detection with empty text"""
        detected = language_detect_agent.detect_lang("")
        assert detected == "en"  # Should fallback to English
    
    def test_detect_hindi_basic(self):
        """Test basic Hindi detection using character heuristics"""
        # Use basic detection method for testing
        with patch.object(language_detect_agent, 'detect_func', language_detect_agent._basic_detect):
            text = "यह एक हिंदी पाठ है।"  # This is a Hindi text
            detected = language_detect_agent.detect_lang(text)
            assert detected in ["hi", "en"]  # Should detect Hindi or fallback to English


class TestTranslation:
    """Test translation functionality"""
    
    def test_translation_cache(self):
        """Test translation caching"""
        # Clear cache first
        translator_agent.clear_cache()
        
        # Mock translation to avoid loading actual models
        with patch.object(translator_agent, 'models', {"hi-en": Mock()}):
            translator_agent.models["hi-en"].return_value = [{"translation_text": "Hello world"}]
            
            # First call should hit the model
            result1 = translator_agent.translate("नमस्ते दुनिया", "hi", "en")
            
            # Second call should hit cache
            result2 = translator_agent.translate("नमस्ते दुनिया", "hi", "en")
            
            assert result1 == result2
            # Model should only be called once due to caching
            assert translator_agent.models["hi-en"].call_count == 1
    
    def test_translation_fallback(self):
        """Test translation fallback when model unavailable"""
        original_text = "Hello world"
        
        # Test with no model available
        with patch.object(translator_agent, 'models', {"hi-en": None}):
            result = translator_agent.translate(original_text, "en", "hi")
            assert result == original_text  # Should return original text
    
    def test_empty_text_translation(self):
        """Test translation with empty text"""
        result = translator_agent.translate("", "en", "hi")
        assert result == ""


class TestEmbeddingServiceLanguageFiltering:
    """Test language filtering in embedding service"""
    
    @pytest.mark.asyncio
    async def test_search_with_language_filter(self):
        """Test search with language filtering"""
        document_id = "test_doc"
        query = "test query"
        
        # Mock the embedding service components
        with patch.object(embedding_service, 'model', Mock()):
            with patch.object(embedding_service, 'chroma_client') as mock_client:
                # Mock collection and search results
                mock_collection = Mock()
                mock_client.get_collection.return_value = mock_collection
                
                # Mock search results with language metadata
                mock_results = {
                    'documents': [["Test document 1", "Test document 2"]],
                    'metadatas': [[
                        {'lang': 'en', 'page': 1},
                        {'lang': 'hi', 'page': 2}
                    ]],
                    'distances': [[0.1, 0.2]]
                }
                mock_collection.query.return_value = mock_results
                
                # Mock embedding generation
                embedding_service.model.encode.return_value = [[0.1, 0.2, 0.3]]
                
                # Test search with English filter
                results = await embedding_service.search_similar(document_id, query, n_results=5, lang="en")
                
                # Should only return English results
                assert len(results['results']) == 1
                assert results['results'][0]['metadata']['lang'] == 'en'


class TestMultilingualOrchestrator:
    """Test multilingual orchestrator functionality"""
    
    @pytest.mark.asyncio
    async def test_auto_detect_english(self):
        """Test auto-detection with English query"""
        # Mock base orchestrator
        mock_base = Mock(spec=RAGOrchestrator)
        mock_base.handle_query = AsyncMock()
        mock_base.handle_query.return_value = iter([
            'data: {"type": "done", "data": {"answer": "Test answer"}}\n\n'
        ])
        
        orchestrator = MultilangOrchestrator(mock_base)
        
        # Mock language detection to return English
        with patch.object(language_detect_agent, 'detect_lang', return_value='en'):
            events = []
            async for event in orchestrator.handle_query(
                document_id="test_doc",
                question="What is this document about?",
                lang="auto_detect"
            ):
                events.append(event)
        
        # Should have lang-detected event
        assert any('lang-detected' in event for event in events)
        # Should call base orchestrator with detected language
        mock_base.handle_query.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_translation_flow(self):
        """Test translation flow for non-English query"""
        # Mock base orchestrator
        mock_base = Mock(spec=RAGOrchestrator)
        mock_base.handle_query = AsyncMock()
        mock_base.handle_query.return_value = iter([
            'data: {"type": "done", "data": {"answer": "Test answer"}}\n\n'
        ])
        
        orchestrator = MultilangOrchestrator(mock_base)
        
        # Mock language detection and translation
        with patch.object(language_detect_agent, 'detect_lang', return_value='hi'):
            with patch.object(translator_agent, 'translate') as mock_translate:
                mock_translate.side_effect = ["What is this document about?", "परीक्षण उत्तर"]
                
                with patch('app.core.config.settings.ENABLE_TRANSLATION', True):
                    events = []
                    async for event in orchestrator.handle_query(
                        document_id="test_doc",
                        question="यह दस्तावेज़ कि��� बारे में है?",
                        lang="auto_detect"
                    ):
                        events.append(event)
                
                # Should have translation events
                assert any('translation' in event for event in events)
                # Should translate query and answer
                assert mock_translate.call_count == 2


class TestIntegration:
    """Integration tests for multilingual functionality"""
    
    def test_language_config_loaded(self):
        """Test that language configuration is properly loaded"""
        from app.core.config import settings
        
        assert hasattr(settings, 'SUPPORTED_LANGUAGES')
        assert hasattr(settings, 'ENABLE_TRANSLATION')
        assert hasattr(settings, 'TRANSLATION_MODELS')
        
        # Should have at least English in supported languages
        supported = settings.SUPPORTED_LANGUAGES.split(',')
        assert 'en' in supported
    
    def test_agents_initialized(self):
        """Test that multilingual agents are properly initialized"""
        # Language detection agent should be available
        assert language_detect_agent is not None
        assert hasattr(language_detect_agent, 'detect_lang')
        
        # Translation agent should be available
        assert translator_agent is not None
        assert hasattr(translator_agent, 'translate')


if __name__ == "__main__":
    pytest.main([__file__])