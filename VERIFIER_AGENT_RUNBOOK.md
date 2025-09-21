# Level 7 VerifierAgent Integration Runbook

## Overview
This document provides a comprehensive guide for integrating and using the Level 7 VerifierAgent in the DocAI RAG system. The VerifierAgent enhances answer quality by verifying responses against source documents and providing confidence scores.

## Architecture

### Backend Components
- **VerifierAgent** (`app/agents/verifier_agent.py`): Core verification logic
- **RAGOrchestrator** (`app/orchestrator/rag_orchestrator.py`): Orchestrates the verification process
- **API Endpoints** (`app/api/endpoints/rag.py`): Exposes verification results via REST API

### Frontend Components
- **VerifiedAnswerCard** (`components/chat/verified-answer-card.jsx`): Displays verification badges and details
- **ChatContainer** (`components/chat/chat-container.jsx`): Handles verification data from SSE
- **SourcePanel** (`components/chat/source-panel.jsx`): Shows sources with highlighted phrases
- **SourceSnippet** (`components/chat/source-snippet.jsx`): Highlights matched phrases in source text

## Verification Process

### 1. Answer Generation
The system generates an answer using the GeneratorAgent based on retrieved document chunks.

### 2. Verification
The VerifierAgent verifies the generated answer by:
- Analyzing the question-answer pair
- Cross-referencing with source document chunks
- Calculating confidence scores
- Identifying potential hallucinations
- Extracting matched phrases for highlighting

### 3. Result Structure
```json
{
  "confidence_score": 0.85,
  "confidence_level": "high|medium|low",
  "issues": ["List of identified issues"],
  "fact_checks": ["Fact checking results"],
  "context_coverage": 0.92,
  "hallucination_risk": "low|medium|high",
  "matched_phrases": ["phrase1", "phrase2"]
}
```

## API Usage

### Streaming Response
```javascript
// Frontend receives verification data via SSE
const eventSource = startRagStream(documentId, question);

// Handle verification result
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'done') {
    const verificationResult = data.data.verification_result;
    // Update UI with verification data
  }
};
```

### Non-Streaming Response
```javascript
const response = await ragQuery(documentId, question);
const verificationResult = response.verification_result;
```

## UI Integration

### Verification Badge Display
The VerifiedAnswerCard component displays:
- Confidence level badge (Verified/Partially Verified/Unverified)
- Confidence score percentage
- Hallucination risk indicator

### Source Highlighting
- Matched phrases are highlighted in yellow in source snippets
- Tooltip shows explanation of highlighting
- Confidence scores shown for each source

## Configuration

### Environment Variables
```bash
# VerifierAgent configuration
VERIFIER_MODEL=gemma:2b
VERIFIER_TEMPERATURE=0.1
VERIFIER_MAX_TOKENS=512
```

### Thresholds
- **High Confidence**: > 0.8
- **Medium Confidence**: 0.6 - 0.8
- **Low Confidence**: < 0.6

## Monitoring and Logging

### Key Metrics
- Verification confidence distribution
- Hallucination risk levels
- Processing time per verification
- Error rates

### Logging
```python
logger.info(f"Verification completed for request {request_id}")
logger.info(f"Confidence score: {result.confidence_score}")
logger.info(f"Hallucination risk: {result.hallucination_risk}")
```

## Troubleshooting

### Common Issues

#### Low Confidence Scores
- **Cause**: Insufficient relevant source material
- **Solution**: Improve document chunking or retrieval parameters

#### High Hallucination Risk
- **Cause**: Answer deviates from source content
- **Solution**: Adjust generation parameters or review source quality

#### Streaming Verification Errors
- **Cause**: Empty answer passed to verifier
- **Solution**: Ensure full answer is accumulated before verification

### Debug Mode
Enable debug logging to trace verification process:
```python
import logging
logging.getLogger('verifier_agent').setLevel(logging.DEBUG)
```

## Performance Considerations

### Optimization Strategies
1. **Caching**: Cache verification results for similar queries
2. **Batch Processing**: Process multiple verifications in parallel
3. **Model Selection**: Use appropriate model size for accuracy vs speed trade-off

### Benchmarks
- Average verification time: < 2 seconds
- Memory usage: ~500MB for Gemma 2B model
- Accuracy: > 85% for well-sourced answers

## Testing

### Unit Tests
```bash
# Run verifier agent tests
pytest tests/test_verifier_agent.py -v

# Run orchestrator integration tests
pytest tests/test_orchestrator.py -v
```

### Integration Tests
```bash
# Test full RAG pipeline with verification
pytest tests/test_rag_integration.py -v
```

### Manual Testing Checklist
- [ ] Verify confidence badges display correctly
- [ ] Check source highlighting works
- [ ] Test streaming vs non-streaming responses
- [ ] Validate error handling for failed verifications

## Deployment

### Prerequisites
- Python 3.8+
- Ollama with Gemma 2B model
- Node.js 16+ for frontend

### Deployment Steps
1. Install dependencies: `pip install -r requirements.txt`
2. Start Ollama service: `ollama serve`
3. Pull verification model: `ollama pull gemma:2b`
4. Start backend: `uvicorn main:app --host 0.0.0.0 --port 8000`
5. Start frontend: `npm run dev`

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Model availability
curl http://localhost:11434/api/tags
```

## Future Enhancements

### Planned Features
- Multi-language verification support
- Custom verification models
- Real-time verification feedback
- Advanced hallucination detection algorithms

### Research Areas
- Cross-document verification
- Temporal consistency checking
- Multi-modal verification (text + images)

## Support

### Contact Information
- **Technical Lead**: [Team Lead Name]
- **Documentation**: This runbook
- **Issue Tracking**: GitHub Issues

### Escalation Path
1. Check this runbook for known issues
2. Review application logs
3. Create detailed bug report with reproduction steps
4. Escalate to development team

---

*Last Updated: [Current Date]*
*Version: 1.0*
