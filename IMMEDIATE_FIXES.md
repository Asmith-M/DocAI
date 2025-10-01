# Immediate Fixes for Streaming Timeout Issue

## 🚨 Current Problem
The streaming is timing out after 30 seconds with "Streaming chunk timed out after 30s" and no answer is being generated.

## 🔍 Root Causes Identified

### 1. Configuration Not Applied
- The logs show old configuration (Context Length: 512) instead of new settings (8192)
- The server needs to be restarted to pick up new environment variables

### 2. Model Availability Issues
- System is trying to use models that don't exist in Ollama
- Available models: `['mistral:7b-instruct-q4_0', 'gemma:2b-instruct-q4_0']`
- Configuration was set to `mistral:7b-instruct-v0.3` (doesn't exist)

### 3. Streaming Timeout Too Short
- Original 30-second timeout is too short for model generation
- Increased to 120 seconds but needs server restart

## ⚡ Immediate Actions Required

### Step 1: Restart the Backend Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd "C:\Users\Sezal Sharma\DocAI\docai_backend"
uvicorn main:app --reload
```

### Step 2: Verify Model Configuration
The `.env` file is already correctly set to:
```
OLLAMA_MODEL=mistral:7b-instruct-q4_0
OLLAMA_MODEL_FALLBACK=gemma:2b-instruct-q4_0
OLLAMA_CTX=8192
OLLAMA_NUM_PREDICT=512
```

### Step 3: Test System Components
Run the diagnostic scripts:
```bash
# Test Ollama models
python test_ollama_models.py

# Test overall system
python diagnose_system.py
```

## 🔧 Code Changes Made

### 1. Ollama Client Timeout Fix
- Increased streaming timeout from 30s to 120s
- Added better error handling and logging
- Improved chunk counting and progress tracking

### 2. Generator Agent Improvements
- Fixed fallback model switching to update client model
- Simplified prompt format for better reliability
- Reduced chunk size from 1200 to 800 characters
- Enhanced error handling and logging

### 3. Streaming Response Improvements
- Better timeout handling
- Immediate stream flush with empty answer
- Enhanced error recovery

## 🧪 Testing Steps

### 1. After Server Restart
1. Check logs for correct configuration:
   ```
   Primary Model: mistral:7b-instruct-q4_0
   Context Length: 8192
   Max Predictions: 512
   ```

2. Verify model availability:
   ```
   ✓ Ollama model 'mistral:7b-instruct-q4_0' is loaded and ready
   ```

### 2. Test Streaming
1. Try a simple question in the frontend
2. Monitor logs for:
   - "First chunk received, streaming started"
   - No timeout errors
   - Successful completion

### 3. Fallback Testing
If primary model fails, should see:
```
GeneratorAgent: Switched to fallback model 'gemma:2b-instruct-q4_0'
```

## 📊 Expected Results After Fixes

### ✅ What Should Work
- Streaming responses within 30-60 seconds
- Proper model loading and switching
- Context window of 8192 tokens (vs 512)
- Better error handling and recovery

### 🔍 Monitoring Points
- Check first token arrives within 10-15 seconds
- Monitor memory usage with larger context
- Verify fallback model switching works
- Confirm no JSON parsing errors initially

## 🚨 If Issues Persist

### Check Ollama Service
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Check specific model
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "mistral:7b-instruct-q4_0",
  "prompt": "Hello",
  "stream": false
}'
```

### Check Backend Logs
Look for:
- Model loading errors
- Timeout messages
- Memory issues
- Connection problems

### Alternative Models
If `mistral:7b-instruct-q4_0` doesn't work:
1. Try `gemma:2b-instruct-q4_0` (smaller, faster)
2. Pull a different model: `ollama pull llama2:7b-chat`

## 📋 Next Steps After Basic Fix

1. **Restore JSON Output**: Once streaming works, re-enable JSON schema
2. **Performance Tuning**: Optimize chunk sizes and context windows
3. **Advanced Features**: Re-enable sophisticated prompt engineering
4. **Monitoring**: Add performance metrics and health checks

---

**Priority**: 🔥 CRITICAL - Must restart server first
**Status**: Ready for testing after server restart
**ETA**: Should work within 5-10 minutes of server restart