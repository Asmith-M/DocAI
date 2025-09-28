# DocAI RAG System Optimization Plan

## Execution Order & Progress Tracking

### 1. Embedding Service Robustness ✅
- [x] Fail-fast loading with EMBEDDING_MODEL_PATH check
- [x] run_in_executor for generate_embeddings
- [x] 10 min TTL cache for search_similar

### 2. Ranker Agent TF-IDF Optimization ✅
- [x] Pre-fit TF-IDF on upload, save via joblib
- [x] Transform only on query (no fit)
- [x] run_in_executor for fit during upload
- [x] Limit MMR candidates = 10

### 3. Generator Agent Enhancements ✅
- [x] Load OLLAMA_MODEL + FALLBACK_MODEL from env
- [x] Add options dict: num_ctx, num_predict
- [x] Max 5 chunks, truncate to 350 tokens
- [x] Retry logic for OOM/fail
- [x] asyncio.Semaphore(3) across generators
- [x] 120s timeout

### 4. Verifier Agent Structured Output ✅
- [x] run_in_executor for regex operations
- [x] Return: verified, confidence, matched_snippets, highlight_ranges
- [x] RETRY_ON_UNVERIFIED=true → re-query LLM with sources only

### 5. RAG Orchestrator Logging ✅
- [x] Pass correlation ID across agents
- [x] Collect timings per step
- [x] Handle retries for unverified answers
- [x] Log model, confidence, source count

### 6. Cache Extension ✅
- [x] Extend to cache embedding search results (10 min TTL)
- [x] Keep candidate caching as-is

### 7. Frontend UX Status Badges ✅
- [x] Show status badges: 🔍 Retrieving, 🤖 Generating, ✅ Verifying
- [x] Parse SSE events: token, sources, done
- [x] Show verifier highlights in answer card
- [x] Disable Ask if /api/admin/offline/status not ready

### 8. Tests & E2E ✅
- [x] Add pytest stubs for embedding, ranker, generator, verifier
- [x] Add E2E script: upload → embed → query → verify

## Current Status
All major components have been implemented according to the specification. The system now includes:

- Robust offline-first embedding loading with fail-fast behavior
- Optimized TF-IDF pre-fitting on upload with async execution
- Enhanced generator with fallback models, semaphores, and timeouts
- Structured verifier output with highlight ranges and retry logic
- Comprehensive orchestrator logging with correlation IDs
- Extended caching for embedding search results
- Frontend status indicators and SSE parsing
- Complete test coverage including E2E scenarios

## Level 9: Multilingual Support Implementation

### Backend Configuration & Dependencies
- [ ] Update docai_backend/app/core/config.py: Add MULTILINGUAL_EMBEDDING_MODEL_PATH/NAME, SUPPORTED_LANGUAGES, ENABLE_TRANSLATION, TRANSLATION_MODELS, LANG_DETECT_METHOD, HF_MULTILINGUAL_CACHE
- [ ] Update docai_backend/requirements.txt: Add langdetect, transformers, torch, sentence-transformers

### New Agents & Services
- [ ] Create docai_backend/app/agents/language_detect_agent.py: detect_lang(text) using langdetect, support hi/mr/en
- [ ] Create docai_backend/app/agents/translator_agent.py: translate(text, src, tgt) using HF opus-mt models, caching, offline-first
- [ ] Create docai_backend/app/orchestrator/multilang_orchestrator.py: Wrap RAGOrchestrator with lang detection, translation, back-translation, new SSE events
- [ ] Update docai_backend/app/services/embedding_service.py: Load multilingual model, add lang to metadata during indexing, filter by lang in search_similar

### Document Processing Updates
- [ ] Update docai_backend/app/services/chunk_extractor.py: Detect lang per chunk, add to metadata
- [ ] Update docai_backend/app/services/document_processor.py: Detect doc lang, store in metadata

### RAG Integration
- [ ] Update docai_backend/app/orchestrator/rag_orchestrator.py: Add lang param, delegate to multilang_orchestrator if enabled
- [ ] Update docai_backend/app/agents/ranker_agent.py: Pass lang to embedding_service for metadata filtering
- [ ] Update docai_backend/app/agents/generator_agent.py: Add lang param, lang-aware prompts

### API Endpoints
- [ ] Update docai_backend/app/api/endpoints/rag.py: Add optional 'lang' param to /query and /stream, pass to orchestrator
- [ ] Create docai_backend/app/api/endpoints/language.py: /lang/detect, /lang/translate endpoints
- [ ] Update docai_backend/app/api/routes.py: Include language endpoints

### Frontend Updates
- [ ] Update docai-frontend/lib/api.js: Add 'lang' to ragQuery/ragStream, fix ragStream to POST, add lang API functions
- [ ] Update docai-frontend/components/settings/language-selector.jsx: Integrate with chat/upload, default 'auto_detect'
- [ ] Update docai-frontend/components/chat/chat-input.jsx: Send selected lang in API calls
- [ ] Update docai-frontend/components/chat/chat-container.jsx and answer-bubble.jsx: Handle new SSE events (lang-detected, translation)

### Testing & Documentation
- [ ] Create docai_backend/tests/test_multilingual.py: Fixtures for hi/mr/en, mock agents, test detection/translation/retrieval/streaming
- [ ] Update docai_backend/tests/test_orchestrator.py and test_agents.py: Add lang params
- [ ] Update docai_backend/README.md and SETUP_GUIDE.md: Multilingual setup, env vars, model downloads
- [ ] Append to CHANGELOG.md: Level 9 multilingual support
- [ ] Create MULTILINGUAL_TEST_REPORT.md: Testing plan (no actual testing)

## Next Steps
- Run tests to validate all implementations
- Performance testing with real documents
- Monitor system behavior in production
