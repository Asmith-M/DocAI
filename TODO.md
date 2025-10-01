# TODO: Improve Multilingual Accuracy and Output Cleaning

## Issues to Address

1. Verifier Agent not working on other language queries and answers (Hindi/Marathi).
2. Clean output to remove unwanted patterns like "\*\*" that cause problems during translation.
3. Increase overall accuracy of output for multilingual queries.

## Plan

- Modify VerifierAgent to translate answer and context to English for verification when dealing with non-English text.
- Add output cleaning logic in MultilangOrchestrator to remove markdown-like patterns (e.g., "\*\*") before translation.
- Ensure translation quality and preprocessing for better accuracy.

## Steps

- [ ] Update verifier_agent.py to handle multilingual verification by translating to English.
- [ ] Update multilang_orchestrator.py to clean output before translation.
- [ ] Test changes with Hindi/Marathi queries.
- [ ] Monitor accuracy improvements and adjust as needed.
