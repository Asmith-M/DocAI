# Chat Response Formatting Fix

## Current Issues

- Response contains unnecessary XML tags like `<answer>` that display literally
- Markdown formatting (**bold**, _bullets_) not rendering properly
- Poor readability and structure

## Plan

1. **Backend Changes:**

   - Strip XML tags from LLM responses in rag_orchestrator.py
   - Ensure clean text output

2. **Frontend Changes:**

   - Install react-markdown library
   - Update verified-answer-card.jsx to render markdown
   - Improve typography and spacing

3. **Testing:**
   - Test chat responses for proper formatting
   - Verify markdown rendering works

## Files to Modify

- docai_backend/app/orchestrator/rag_orchestrator.py
- docai-frontend/package.json
- docai-frontend/components/chat/verified-answer-card.jsx
