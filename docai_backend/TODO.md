# TODO: Fix DocAI Backend Issues

## Completed Tasks

- [x] Update config.py: Change OLLAMA_MODEL_FALLBACK to "phi-2"
- [x] Increase generation timeout in generator_agent.py from 120s to 300s
- [x] Increase streaming timeout in generator_agent.py from 120s to 300s
- [x] Increase streaming timeout in ollama_client.py from 120s to 300s
- [x] Increase OLLAMA_CTX in config.py from 2048 to 4096
- [x] Add better error handling for JSON serialization in rag.py
- [x] Fix incorrect await on async generator in rag_orchestrator.py for streaming

## Followup Steps

- [ ] Update .env file if necessary to ensure correct model names (OLLAMA_MODEL=gemma:2b-instruct-q4_0, OLLAMA_MODEL_FALLBACK=phi-2)
- [ ] Restart the application
- [ ] Test streaming queries to verify fixes
- [ ] Monitor logs for resolution of errors
