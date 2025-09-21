# Multi-Agent RAG System

This document describes the Level 6 implementation of the DocAI RAG (Retrieval-Augmented Generation) system, featuring a multi-agent architecture for enhanced document Q&A capabilities.

## Architecture Overview

The system consists of several key components:

### 1. Agents

#### ChunkAgent (`app/agents/chunk_agent.py`)
- **Purpose**: Handles document chunking and storage
- **Responsibilities**:
  - Creates text and table chunks from parsed PDF pages
  - Stores chunks in JSON format for persistence
  - Supports idempotent operations (no duplicate chunks)

#### RankerAgent (`app/agents/ranker_agent.py`)
- **Purpose**: Ranks and selects candidate chunks for retrieval
- **Features**:
  - Hybrid ranking: semantic (embeddings) + lexical (TF-IDF)
  - Maximal Marginal Relevance (MMR) for diversity
  - Configurable candidate selection

#### GeneratorAgent (`app/agents/generator_agent.py`)
- **Purpose**: Generates answers using Ollama models
- **Features**:
  - Async generation with concurrency limits
  - Streaming token-by-token responses
  - Configurable temperature and model selection

#### VerifierAgent (`app/agents/verifier_placeholder.py`)
- **Purpose**: Verifies answer quality and source relevance
- **Current Implementation**: Placeholder with substring matching
- **Future**: Advanced verification using LLMs

### 2. Orchestrator

#### RAGOrchestrator (`app/orchestrator/rag_orchestrator.py`)
- **Purpose**: Coordinates the entire RAG pipeline
- **Features**:
  - Async query handling
  - Streaming and non-streaming modes
  - Performance timing and logging
  - Error handling and recovery

### 3. Cache

#### RAGCache (`app/cache/rag_cache.py`)
- **Purpose**: Caches retrieval results for performance
- **Features**:
  - TTL-based expiration
  - Configurable size limits
  - Document-specific cache clearing

### 4. API Endpoints

#### RAG Endpoints (`app/api/endpoints/rag.py`)
- **POST /api/rag/query**: Main query endpoint
- **GET /api/rag/stream/{document_id}**: Streaming endpoint
- **POST /api/rag/cancel/{request_id}**: Cancel ongoing requests
- **GET /api/rag/prefetch/{document_id}**: Cache warming
- **Adapter routes**: Backward compatibility with existing frontend

## Usage

### Basic Query
```python
from app.orchestrator.rag_orchestrator import rag_orchestrator

result = await rag_orchestrator.handle_query(
    document_id="doc123",
    question="What is the main topic?",
    top_k=10,
    return_top=5,
    stream=False
)
```

### Streaming Query
```python
async for event in rag_orchestrator.handle_query(
    document_id="doc123",
    question="What is the main topic?",
    stream=True
):
    print(event)  # SSE events
```

### Frontend Integration
```javascript
import { startRagStream } from './lib/api';

const eventSource = startRagStream(documentId, query);
eventSource.onmessage = (e) => {
    const event = JSON.parse(e.data);
    // Handle different event types: meta, source, token, done, error
};
```

## Configuration

Environment variables:
- `RAG_CACHE_SIZE`: Cache size (default: 100)
- `RAG_CACHE_TTL`: Cache TTL in seconds (default: 3600)

## Testing

Run tests with:
```bash
pytest tests/test_agents.py
pytest tests/test_orchestrator.py
pytest tests/test_cache.py
```

## Performance Considerations

1. **Caching**: Retrieval results are cached to reduce embedding search overhead
2. **Concurrency**: Generator agent limits concurrent requests to prevent resource exhaustion
3. **Streaming**: Token-by-token streaming reduces perceived latency
4. **Async Operations**: Full async/await support for non-blocking I/O

## Future Enhancements

1. **Advanced Verification**: LLM-based answer verification
2. **Multi-modal Support**: Image and table understanding
3. **Query Expansion**: Automatic query rewriting and expansion
4. **Feedback Loop**: User feedback integration for continuous improvement
5. **Distributed Caching**: Redis-based distributed cache
6. **Analytics**: Query performance and usage analytics

## Error Handling

The system includes comprehensive error handling:
- Network timeouts and retries
- Model availability checks
- Graceful degradation on component failures
- Detailed logging for debugging

## Monitoring

Key metrics to monitor:
- Query latency (retrieval + generation)
- Cache hit rates
- Error rates by component
- Token usage and costs
- User satisfaction scores
