#!/usr/bin/env python3

import sys
import os
import asyncio
import time
import requests
import json

def test_embedding_performance():
    """Test embedding search performance directly."""
    print("🔍 Testing Embedding Performance...")
    
    try:
        # Get available documents
        response = requests.get("http://127.0.0.1:8000/api/upload/files", timeout=5)
        if response.status_code != 200:
            print("❌ Cannot get document list")
            return False
            
        files_data = response.json()
        files = files_data.get('files', [])
        
        if not files:
            print("⚠️ No documents uploaded for testing")
            return False
            
        doc_id = files[0].get('document_id') or files[0].get('id')
        print(f"📄 Testing with document: {doc_id}")
        
        # Test multiple queries to measure performance
        test_queries = [
            "What is this document about?",
            "What are the main topics?",
            "Tell me about the introduction",
            "What are the key points?",
            "Summarize the content"
        ]
        
        total_time = 0
        successful_queries = 0
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n🧪 Test {i}/5: '{query}'")
            
            start_time = time.time()
            
            # Test non-streaming RAG
            test_data = {
                "query": query,
                "top_k": 5,
                "return_top": 3
            }
            
            try:
                response = requests.post(
                    f"http://127.0.0.1:8000/api/rag/{doc_id}",
                    json=test_data,
                    timeout=30
                )
                
                end_time = time.time()
                query_time = end_time - start_time
                total_time += query_time
                
                if response.status_code == 200:
                    result = response.json()
                    answer = result.get('answer', '')
                    verification = result.get('verification_result', {})
                    timings = result.get('timings_ms', {})
                    
                    print(f"✅ Query completed in {query_time:.2f}s")
                    print(f"   Retrieval: {timings.get('retrieval', 0)}ms")
                    print(f"   Generation: {timings.get('generation', 0)}ms")
                    print(f"   Verification: {timings.get('verification', 0)}ms")
                    print(f"   Answer length: {len(answer)} chars")
                    print(f"   Verification confidence: {verification.get('confidence_score', 0):.2f}")
                    print(f"   Verification level: {verification.get('confidence_level', 'unknown')}")
                    
                    successful_queries += 1
                else:
                    print(f"❌ Query failed: {response.status_code}")
                    print(f"   Response: {response.text[:200]}...")
                    
            except requests.exceptions.Timeout:
                print(f"⏰ Query timed out after 30s")
            except Exception as e:
                print(f"❌ Query error: {e}")
        
        if successful_queries > 0:
            avg_time = total_time / successful_queries
            print(f"\n📊 Performance Summary:")
            print(f"   Successful queries: {successful_queries}/{len(test_queries)}")
            print(f"   Average query time: {avg_time:.2f}s")
            print(f"   Total time: {total_time:.2f}s")
            
            if avg_time < 5.0:
                print("✅ Performance is good (< 5s per query)")
            elif avg_time < 10.0:
                print("⚠️ Performance is acceptable (5-10s per query)")
            else:
                print("❌ Performance is slow (> 10s per query)")
                
            return True
        else:
            print("❌ No successful queries")
            return False
            
    except Exception as e:
        print(f"❌ Embedding performance test failed: {e}")
        return False

def test_streaming_verification():
    """Test streaming with verification integration."""
    print("\n🌊 Testing Streaming with Verification...")
    
    try:
        # Get available documents
        response = requests.get("http://127.0.0.1:8000/api/upload/files", timeout=5)
        if response.status_code != 200:
            print("❌ Cannot get document list")
            return False
            
        files_data = response.json()
        files = files_data.get('files', [])
        
        if not files:
            print("⚠️ No documents uploaded for testing")
            return False
            
        doc_id = files[0].get('document_id') or files[0].get('id')
        print(f"📄 Testing streaming with document: {doc_id}")
        
        # Test streaming endpoint
        test_data = {
            "query": "What is the main topic of this document?",
            "top_k": 5,
            "return_top": 3
        }
        
        start_time = time.time()
        
        response = requests.post(
            f"http://127.0.0.1:8000/api/stream/{doc_id}",
            json=test_data,
            stream=True,
            timeout=60
        )
        
        if response.status_code != 200:
            print(f"❌ Streaming request failed: {response.status_code}")
            return False
        
        print("✅ Streaming started...")
        
        events_received = 0
        tokens_received = 0
        sources_received = 0
        verification_received = False
        final_answer = ""
        verification_result = None
        
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    try:
                        event_data = json.loads(line_str[6:])  # Remove 'data: ' prefix
                        event_type = event_data.get('type')
                        events_received += 1
                        
                        if event_type == 'meta':
                            print(f"📋 Meta: {event_data.get('data', {})}")
                        elif event_type == 'source':
                            sources_received += 1
                            if sources_received <= 3:  # Show first 3 sources
                                source_data = event_data.get('data', {})
                                print(f"📚 Source {sources_received}: page={source_data.get('page')}, relevance={source_data.get('relevance', 0):.2f}")
                        elif event_type == 'answer':
                            print("📝 Answer stream started")
                        elif event_type == 'token':
                            tokens_received += 1
                            token = event_data.get('data', '')
                            final_answer += token
                            if tokens_received <= 5:  # Show first 5 tokens
                                print(f"🔤 Token {tokens_received}: {repr(token)}")
                        elif event_type == 'done':
                            done_data = event_data.get('data', {})
                            final_answer = done_data.get('answer', final_answer)
                            verification_result = done_data.get('verification_result', {})
                            verification_received = True
                            print(f"🏁 Stream completed")
                            break
                            
                    except json.JSONDecodeError as e:
                        print(f"⚠️ Failed to parse event: {line_str[:100]}...")
        
        end_time = time.time()
        total_time = end_time - start_time
        
        print(f"\n📊 Streaming Summary:")
        print(f"   Total time: {total_time:.2f}s")
        print(f"   Events received: {events_received}")
        print(f"   Sources received: {sources_received}")
        print(f"   Tokens received: {tokens_received}")
        print(f"   Final answer length: {len(final_answer)} chars")
        print(f"   Verification received: {verification_received}")
        
        if verification_received and verification_result:
            print(f"   Verification confidence: {verification_result.get('confidence_score', 0):.2f}")
            print(f"   Verification level: {verification_result.get('confidence_level', 'unknown')}")
            print(f"   Hallucination risk: {verification_result.get('hallucination_risk', 'unknown')}")
            
            if verification_result.get('confidence_level') != 'low':
                print("✅ Verification is working properly")
                return True
            else:
                print("⚠️ Verification shows low confidence")
                return False
        else:
            print("❌ No verification result received")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Streaming timed out")
        return False
    except Exception as e:
        print(f"❌ Streaming test failed: {e}")
        return False

def test_backend_health():
    """Test backend health and configuration."""
    print("🏥 Testing Backend Health...")
    
    try:
        # Health check
        response = requests.get("http://127.0.0.1:8000/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend health check passed")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
            
        # Check admin status
        response = requests.get("http://127.0.0.1:8000/api/admin/offline/status", timeout=5)
        if response.status_code == 200:
            status_data = response.json()
            print(f"📊 Offline status: {status_data}")
        
        return True
        
    except Exception as e:
        print(f"❌ Backend health test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Testing Embedding Performance and Verification Integration\n")
    
    # Test backend health
    health_ok = test_backend_health()
    
    if not health_ok:
        print("\n❌ Backend health check failed. Please ensure the backend is running.")
        return
    
    # Test embedding performance
    embedding_ok = test_embedding_performance()
    
    # Test streaming verification
    streaming_ok = test_streaming_verification()
    
    print(f"\n📊 Final Summary:")
    print(f"   Backend Health: {'✅' if health_ok else '❌'}")
    print(f"   Embedding Performance: {'✅' if embedding_ok else '❌'}")
    print(f"   Streaming Verification: {'✅' if streaming_ok else '❌'}")
    
    if embedding_ok and streaming_ok:
        print("\n🎉 All tests passed! The system is working properly.")
    else:
        print("\n⚠️ Some tests failed. Check the logs for details.")
        
        if not embedding_ok:
            print("\n💡 Embedding Performance Issues:")
            print("   - Check if embeddings are generated for documents")
            print("   - Monitor ChromaDB performance")
            print("   - Consider optimizing chunk sizes")
            
        if not streaming_ok:
            print("\n💡 Streaming Verification Issues:")
            print("   - Check if answers are being generated properly")
            print("   - Verify the verifier agent is receiving valid inputs")
            print("   - Monitor streaming response format")

if __name__ == "__main__":
    main()