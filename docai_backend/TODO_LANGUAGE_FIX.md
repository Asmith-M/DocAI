# Language Preservation Fix - Implementation Plan

## Current Status

- [x] Analyzed codebase and identified root cause
- [x] Created implementation plan
- [x] Got user approval to proceed

## Implementation Steps

### 1. Modify RAGOrchestrator to accept language parameter

- [ ] Update `RAGOrchestrator.handle_query()` method signature to accept `language` parameter
- [ ] Pass language parameter to `GeneratorAgent.generate()` calls
- [ ] Update both streaming and non-streaming paths

### 2. Update MultilangOrchestrator to pass detected language

- [ ] Modify `MultilangOrchestrator.handle_query()` to pass detected language to `RAGOrchestrator`
- [ ] Ensure language is passed correctly for both English and non-English queries

### 3. Enhance GeneratorAgent language handling

- [ ] Verify `GeneratorAgent._build_prompt()` correctly uses language parameter
- [ ] Ensure system prompt dynamically instructs LLM to respond in detected language

### 4. Implement structured logging

- [ ] Add structured logging utility in `logger.py`
- [ ] Add logs at key stages: QueryReceived, LanguageDetection, RAGContext, FinalPrompt, LLMResponse
- [ ] Include requestId, timestamp, stage, and relevant data in logs

### 5. Testing and verification

- [ ] Test Hindi query example: "परियोजना के उद्देश्य क्या हैं?"
- [ ] Verify response is in Hindi, not English
- [ ] Check structured logs capture all required information
- [ ] Ensure no unintended translation occurs

## Files to be modified

- `docai_backend/app/orchestrator/rag_orchestrator.py`
- `docai_backend/app/orchestrator/multilang_orchestrator.py`
- `docai_backend/app/agents/generator_agent.py`
- `docai_backend/app/utils/logger.py`

## Expected Outcome

- LLM responses maintain the same language as user queries
- Robust logging traces language context throughout request lifecycle
- No unintended translation of queries or responses
