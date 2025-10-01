#!/usr/bin/env python3

import sys
import os
import asyncio
import json
sys.path.append(os.path.join(os.path.dirname(__file__), 'docai_backend'))

from docai_backend.app.agents.verifier_agent import verifier_agent
from docai_backend.app.agents.generator_agent import GeneratorAgent
from docai_backend.app.orchestrator.rag_orchestrator import rag_orchestrator

async def test_verifier_agent():
    """Test the verifier agent with various scenarios."""
    print("🔍 Testing Verifier Agent...")
    
    # Test case 1: Basic verification
    query = "What is artificial intelligence?"
    answer = "Artificial intelligence (AI) is a technology that enables machines to think and learn like humans."
    context_chunks = [
        {
            'text': 'Artificial intelligence (AI) is a technology that enables machines to think and learn like humans. It involves creating computer systems that can perform tasks that typically require human intelligence.',
            'metadata': {'page': 1, 'chunk_index': 0}
        }
    ]
    
    result = verifier_agent.verify_answer(query, answer, context_chunks)
    print(f"✅ Test 1 - Basic verification:")
    print(f"   Confidence Score: {result.get('confidence_score', 0):.2f}")
    print(f"   Confidence Level: {result.get('confidence_level', 'unknown')}")
    print(f"   Issues: {result.get('issues', [])}")
    print(f"   Hallucination Risk: {result.get('hallucination_risk', 'unknown')}")
    print()
    
    # Test case 2: Empty inputs
    result2 = verifier_agent.verify_answer("", "", [])
    print(f"✅ Test 2 - Empty inputs:")
    print(f"   Confidence Score: {result2.get('confidence_score', 0):.2f}")
    print(f"   Issues: {result2.get('issues', [])}")
    print()
    
    # Test case 3: Hallucination detection
    query3 = "What is the capital of France?"
    answer3 = "The capital of France is Berlin, and it has a population of 10 million people."
    context_chunks3 = [
        {
            'text': 'Paris is the capital and most populous city of France.',
            'metadata': {'page': 1, 'chunk_index': 0}
        }
    ]
    
    result3 = verifier_agent.verify_answer(query3, answer3, context_chunks3)
    print(f"✅ Test 3 - Hallucination detection:")
    print(f"   Confidence Score: {result3.get('confidence_score', 0):.2f}")
    print(f"   Confidence Level: {result3.get('confidence_level', 'unknown')}")
    print(f"   Hallucination Risk: {result3.get('hallucination_risk', 'unknown')}")
    print()

async def test_generator_agent():
    """Test the generator agent with context window management."""
    print("🤖 Testing Generator Agent...")
    
    try:
        generator = GeneratorAgent()
        
        # Test with small context
        question = "What is machine learning?"
        context_chunks = [
            {
                'text': 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.',
                'metadata': {'page': 1, 'chunk_index': 0}
            }
        ]
        
        print("Testing non-streaming generation...")
        result = await generator.generate(question, context_chunks, stream=False)
        print(f"✅ Non-streaming result length: {len(result)} characters")
        print(f"   Result preview: {result[:200]}...")
        print()
        
        print("Testing streaming generation...")
        stream_result = await generator.generate(question, context_chunks, stream=True)
        
        if hasattr(stream_result, '__aiter__'):
            print("✅ Streaming generator returned")
            token_count = 0
            async for token in stream_result:
                token_count += 1
                if token_count <= 5:  # Show first 5 tokens
                    print(f"   Token {token_count}: {repr(token)}")
                if token_count >= 10:  # Limit for testing
                    break
            print(f"   Total tokens processed: {token_count}")
        else:
            print(f"⚠️ Expected async generator, got: {type(stream_result)}")
        
    except Exception as e:
        print(f"❌ Generator test failed: {e}")
        print(f"   Error type: {type(e).__name__}")

def test_json_parsing():
    """Test JSON parsing functionality."""
    print("📄 Testing JSON Parsing...")
    
    # Test cases for JSON parsing
    test_cases = [
        '{"answer": "This is a test answer", "sources": ["source1"]}',
        '```json\n{"answer": "This is a test answer", "sources": ["source1"]}\n```',
        'Some text before {"answer": "This is a test answer", "sources": ["source1"]} some text after',
        '{"answer": "Incomplete answer...',
        'Not JSON at all',
        ''
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        result = rag_orchestrator._parse_json_response(test_case)
        print(f"✅ Test case {i}:")
        print(f"   Input: {repr(test_case[:50])}...")
        print(f"   Result: {result}")
        print()

async def test_context_window():
    """Test context window management."""
    print("📏 Testing Context Window Management...")
    
    try:
        generator = GeneratorAgent()
        
        # Create a large context that should trigger truncation
        large_text = "This is a very long text that should be truncated. " * 100
        large_context_chunks = [
            {
                'text': large_text,
                'metadata': {'page': 1, 'chunk_index': 0}
            }
        ] * 10  # 10 large chunks
        
        question = "What is the main topic?"
        
        # Test prompt building and truncation
        prompt = generator._build_prompt(question, large_context_chunks)
        print(f"✅ Prompt length after truncation: {len(prompt)} characters")
        print(f"   Max allowed: {generator.client.client.host if hasattr(generator.client, 'client') else 'N/A'}")
        print(f"   Prompt preview: {prompt[:200]}...")
        print()
        
    except Exception as e:
        print(f"❌ Context window test failed: {e}")

async def main():
    """Run all tests."""
    print("🚀 Starting RAG System Debug Tests\n")
    
    # Test verifier agent
    await test_verifier_agent()
    
    # Test JSON parsing
    test_json_parsing()
    
    # Test context window management
    await test_context_window()
    
    # Test generator agent (requires Ollama to be running)
    print("⚠️ Generator tests require Ollama to be running...")
    try:
        await test_generator_agent()
    except Exception as e:
        print(f"❌ Generator tests skipped: {e}")
    
    print("🏁 Debug tests completed!")

if __name__ == "__main__":
    asyncio.run(main())