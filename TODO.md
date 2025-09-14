# Level 5 RAG Query Implementation

## Backend Implementation
- [ ] Add OLLAMA_HOST and OLLAMA_MODEL env vars to config.py (default gemma:2b)
- [ ] Create app/agents/ directory with RankerAgent, GeneratorAgent, VerifierAgent
- [ ] Implement RankerAgent.get_candidates() with lexical+cosine reranking, MMR
- [ ] Implement GeneratorAgent.generate_answer() with Ollama streaming
- [ ] Implement VerifierAgent for deterministic checks
- [ ] Create app/services/rag_service.py with caching, prefetching
- [ ] Create app/api/endpoints/rag.py with /api/rag/query, /api/rag/stream endpoints
- [ ] Add adapter endpoint POST /api/embed/search/{document_id} to map to RAG
- [x] Update requirements.txt for ollama client
- [ ] Add logging and metrics for RAG operations

## Frontend Integration
- [x] Add ragQuery and ragStream functions to lib/api.js
- [x] Update chat-container.jsx to handle streaming responses
- [x] Add SSE client support for streaming
- [x] Update chat-input.jsx to pass documentId to API calls
- [x] Preserve UI colors and layout (Lavender #C9A7EB, Charcoal #1E1E2F, etc.)
- [x] Add stop generation button and source panel updates

## Testing & Validation
- [ ] Test RAG endpoints with curl
- [ ] Test streaming in browser
- [ ] Verify no UI breakage
- [ ] Test error handling (missing embeddings, Ollama timeout)
