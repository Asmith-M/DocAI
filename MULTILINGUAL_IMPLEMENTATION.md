# Multilingual Implementation Guide

## Overview

DocAI now supports full multilingual functionality including automatic language detection, query translation, and answer translation. The system can handle documents and queries in multiple languages while maintaining the existing UI and functionality.

## Features Implemented

### Backend Features

1. **Language Detection**
   - Automatic detection of query language using `langdetect` library
   - Fallback to basic character-set detection for Hindi/Marathi
   - Configurable detection method via `LANG_DETECT_METHOD`

2. **Translation**
   - Query translation from detected language to English for processing
   - Answer translation back to the original language
   - Uses Helsinki-NLP translation models via Hugging Face Transformers
   - Translation caching for improved performance
   - Configurable via `ENABLE_TRANSLATION` setting

3. **Language-Filtered Retrieval**
   - Chunks are tagged with detected language during embedding generation
   - Search can be filtered by language to improve relevance
   - Supports mixed-language documents

4. **Multilingual Orchestrator**
   - Coordinates language detection, translation, and RAG processing
   - Emits SSE events for language detection and translation status
   - Handles both streaming and non-streaming queries

5. **Language API Endpoints**
   - `/api/language/supported` - Get supported languages and translation pairs
   - `/api/language/detect` - Detect language of text
   - `/api/language/translate` - Translate text between languages
   - `/api/language/status` - Get status of language services
   - `/api/language/clear-cache` - Clear translation cache

### Frontend Features

1. **Language Selection UI**
   - Auto-detect toggle in chat input
   - Language dropdown with English, Hindi, and Marathi options
   - Visual indicators for selected language

2. **Multilingual Event Handling**
   - Handles `lang-detected` SSE events with toast notifications
   - Handles `translation` SSE events for query and answer translation
   - Shows translation status in the UI

3. **Translation Display**
   - Shows translation badges on bot messages when translation occurred
   - Displays original and translated language information
   - Maintains existing UI design and functionality

## Configuration

### Environment Variables

```bash
# Multilingual settings
SUPPORTED_LANGUAGES=en,hi,mr
ENABLE_TRANSLATION=true
LANG_DETECT_METHOD=langdetect
HF_MULTILINGUAL_CACHE=./app/storage/hf_multilingual_cache

# Translation models (Helsinki-NLP opus-mt)
HI_EN_MODEL=Helsinki-NLP/opus-mt-hi-en
EN_HI_MODEL=Helsinki-NLP/opus-mt-en-hi
MR_EN_MODEL=Helsinki-NLP/opus-mt-mr-en
EN_MR_MODEL=Helsinki-NLP/opus-mt-en-mr
```

### Dependencies

The following dependencies are required in `requirements.txt`:

```
langdetect>=1.0.9
transformers>=4.21.0
```

## Usage

### Frontend Usage

1. **Auto-detect Mode (Default)**
   - Toggle the globe icon to enable auto-detection
   - System will automatically detect the language of your query
   - Queries will be translated to English for processing
   - Answers will be translated back to the detected language

2. **Manual Language Selection**
   - Disable auto-detect and select a specific language from the dropdown
   - System will assume queries are in the selected language
   - Translation will occur if the selected language is not English

### API Usage

#### Language Detection
```bash
curl -X POST "http://localhost:8000/api/language/detect" \
  -H "Content-Type: application/json" \
  -d '{"text": "यह एक हिंदी वाक्य है"}'
```

#### Translation
```bash
curl -X POST "http://localhost:8000/api/language/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "source_lang": "en",
    "target_lang": "hi"
  }'
```

#### RAG Query with Language
```bash
curl -X POST "http://localhost:8000/api/stream/document_id" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "यह दस्तावेज़ किस बारे में है?",
    "auto_detect": true
  }'
```

## Architecture

### Flow Diagram

```
User Query → Language Detection → Query Translation (if needed) → 
RAG Processing → Answer Generation → Answer Translation (if needed) → 
Response to User
```

### Key Components

1. **LanguageDetectAgent** (`app/agents/language_detect_agent.py`)
   - Handles language detection using langdetect or basic heuristics
   - Configurable detection methods

2. **TranslatorAgent** (`app/agents/translator_agent.py`)
   - Manages translation models and caching
   - Supports multiple translation pairs

3. **MultilangOrchestrator** (`app/orchestrator/multilang_orchestrator.py`)
   - Coordinates the multilingual RAG flow
   - Emits SSE events for real-time updates

4. **EmbeddingService** (`app/services/embedding_service.py`)
   - Enhanced to store language metadata with chunks
   - Supports language-filtered search

## SSE Events

The system emits the following Server-Sent Events during multilingual processing:

1. **lang-detected**
   ```json
   {
     "type": "lang-detected",
     "data": {"lang": "hi"}
   }
   ```

2. **translation**
   ```json
   {
     "type": "translation",
     "data": {
       "direction": "query-to-en",
       "original": "यह दस्तावेज़ किस बारे में है?",
       "translated": "What is this document about?"
     }
   }
   ```

3. **done** (enhanced)
   ```json
   {
     "type": "done",
     "data": {
       "answer": "यह दस्तावेज़ एक तकनीकी मैनुअल है।",
       "original_lang": "en",
       "translated_lang": "hi",
       "verification_result": {...}
     }
   }
   ```

## Testing

Run the multilingual tests:

```bash
cd docai_backend
python -m pytest tests/test_multilingual.py -v
```

The test suite covers:
- Language detection functionality
- Translation caching and fallbacks
- Embedding service language filtering
- Multilingual orchestrator flow
- Integration tests

## Troubleshooting

### Common Issues

1. **Translation models not loading**
   - Ensure internet connection for first-time model download
   - Check `HF_MULTILINGUAL_CACHE` directory permissions
   - Verify `ENABLE_TRANSLATION=true` in configuration

2. **Language detection not working**
   - Install langdetect: `pip install langdetect>=1.0.9`
   - Check `LANG_DETECT_METHOD` configuration
   - Verify supported languages in `SUPPORTED_LANGUAGES`

3. **UI not showing translation events**
   - Check browser console for JavaScript errors
   - Verify SSE connection is established
   - Ensure toast notification system is working

### Performance Considerations

1. **Translation Caching**
   - Translation results are cached to improve performance
   - Cache size is limited to 1000 entries by default
   - Use `/api/language/clear-cache` to clear cache if needed

2. **Model Loading**
   - Translation models are loaded on first use
   - Consider pre-loading models in production environments
   - Monitor memory usage with multiple translation models

3. **Language Filtering**
   - Language-filtered search may require more results to be retrieved
   - The system automatically adjusts search parameters when filtering
   - Consider the impact on retrieval performance with large document sets

## Future Enhancements

1. **Additional Languages**
   - Add more language pairs to `TRANSLATION_MODELS`
   - Update `SUPPORTED_LANGUAGES` configuration
   - Test with additional Helsinki-NLP models

2. **Multilingual Embeddings**
   - Consider using multilingual embedding models
   - Evaluate paraphrase-multilingual-mpnet-base-v2
   - Compare performance with translation-based approach

3. **Advanced Language Detection**
   - Implement confidence scoring for language detection
   - Add support for mixed-language documents
   - Improve detection accuracy for short texts

4. **UI Enhancements**
   - Add language confidence indicators
   - Show translation progress bars
   - Implement language-specific formatting

## Conclusion

The multilingual implementation provides comprehensive language support while maintaining backward compatibility with existing functionality. The system automatically handles language detection and translation, making it seamless for users to interact with documents in their preferred language.