#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'docai_backend'))

from docai_backend.app.agents.verifier_agent import verifier_agent

def test_verifier():
    print("Testing Verifier Agent...")
    
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
    
    print("Verifier Agent tests completed!")

if __name__ == "__main__":
    test_verifier()