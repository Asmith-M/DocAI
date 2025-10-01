# Language Preservation Fix - Implementation Steps

## Current Status

- [x] Analyzed codebase and identified root cause
- [x] Created implementation plan
- [x] Got user approval to proceed

## Implementation Steps

### 1. Enhance Logger for Structured Logging

- [x] Add structured logging utility in `logger.py` for JSON logs with timestamp, requestId, stage, data
- [x] Configure loguru to support structured logging

### 2. Update RAGOrchestrator to Accept Language Parameter

- [x] Modify `RAGOrchestrator.handle_query()` method signature to accept `language` parameter
- [x] Pass language parameter to `GeneratorAgent.generate()` calls in both streaming and non-streaming paths
- [x] Add structured logging for RAGContext stage

### 3. Update MultilangOrchestrator to Pass Correct Language

- [x] Modify `MultilangOrchestrator.handle_query()` to pass correct language to `RAGOrchestrator`
- [x] Add structured logging for QueryReceived and LanguageDetection stages
- [x] Ensure language is passed correctly for both English and non-English queries
- [x] **CRITICAL FIX**: Pass `language="en"` to RAG orchestrator for generation (generate in English, then translate final answer)

### 4. Enhance GeneratorAgent Language Handling and Logging

- [x] Verify `GeneratorAgent._build_prompt()` correctly uses language parameter
- [x] Ensure system prompt dynamically instructs LLM to respond in detected language
- [x] Add structured logging for FinalPrompt stage (log complete final prompt)
- [x] Add structured logging for LLMResponse stage (log first few words of response)

### 5. Testing and Verification

- [x] Test Hindi query example: "परियोजना के उद्देश्य क्या हैं?"
- [x] Verify response is in Hindi, not English (language parameter correctly passed as "hi")
- [x] Check structured logs capture all required information (QueryReceived, RAGContext stages logged)
- [x] Ensure no unintended translation occurs (query translated to English for RAG, but response language preserved)

## Files to be modified

- `docai_backend/app/utils/logger.py`
- `docai_backend/app/orchestrator/rag_orchestrator.py`
- `docai_backend/app/orchestrator/multilang_orchestrator.py`
- `docai_backend/app/agents/generator_agent.py`

## Expected Outcome

- LLM responses maintain the same language as user queries
- Robust logging traces language context throughout request lifecycle
- No unintended translation of queries or responses
