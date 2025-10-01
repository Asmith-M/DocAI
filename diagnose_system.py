#!/usr/bin/env python3

import sys
import os
import requests
import json

def check_backend_status():
    """Check if the backend is running and configured correctly."""
    try:
        print("🔍 Checking DocAI Backend...")
        
        # Check health endpoint
        response = requests.get("http://127.0.0.1:8000/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend health check passed")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            
        # Check offline status
        response = requests.get("http://127.0.0.1:8000/api/admin/offline/status", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Offline status: {data}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False

def check_ollama_status():
    """Check Ollama service and models."""
    try:
        print("\n🔍 Checking Ollama Service...")
        
        # Check if service is running
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = [model['name'] for model in data.get('models', [])]
            print(f"✅ Ollama service is running")
            print(f"📋 Available models: {models}")
            
            # Test a simple generation
            if models:
                test_model = models[0]
                print(f"\n🧪 Testing generation with {test_model}...")
                
                test_data = {
                    "model": test_model,
                    "prompt": "Hello, how are you?",
                    "stream": False
                }
                
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json=test_data,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    answer = result.get('response', '').strip()
                    print(f"✅ Generation test passed")
                    print(f"📝 Response: {answer[:100]}...")
                else:
                    print(f"❌ Generation test failed: {response.status_code}")
            
            return True
        else:
            print(f"❌ Ollama service returned status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Ollama: {e}")
        return False

def test_rag_endpoint():
    """Test the RAG streaming endpoint."""
    try:
        print("\n🔍 Testing RAG Endpoint...")
        
        # First get available documents
        response = requests.get("http://127.0.0.1:8000/api/upload/files", timeout=5)
        if response.status_code != 200:
            print("❌ Cannot get document list")
            return False
            
        files_data = response.json()
        files = files_data.get('files', [])
        
        if not files:
            print("⚠️ No documents uploaded for testing")
            return False
            
        # Use first document for testing
        doc_id = files[0].get('document_id') or files[0].get('id')
        print(f"📄 Testing with document: {doc_id}")
        
        # Test non-streaming first
        test_data = {
            "query": "What is this document about?",
            "top_k": 5,
            "return_top": 3
        }
        
        print("🧪 Testing non-streaming RAG...")
        response = requests.post(
            f"http://127.0.0.1:8000/api/rag/{doc_id}",
            json=test_data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get('answer', '')
            print(f"✅ Non-streaming RAG works")
            print(f"📝 Answer length: {len(answer)} characters")
            if answer:
                print(f"📝 Answer preview: {answer[:200]}...")
        else:
            print(f"❌ Non-streaming RAG failed: {response.status_code}")
            print(f"📝 Response: {response.text[:200]}...")
            
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ RAG endpoint test failed: {e}")
        return False

def main():
    """Run all diagnostics."""
    print("🚀 DocAI System Diagnostics\n")
    
    # Check backend
    backend_ok = check_backend_status()
    
    # Check Ollama
    ollama_ok = check_ollama_status()
    
    # Test RAG if both are working
    if backend_ok and ollama_ok:
        test_rag_endpoint()
    
    print(f"\n📊 Summary:")
    print(f"   Backend: {'✅' if backend_ok else '❌'}")
    print(f"   Ollama: {'✅' if ollama_ok else '❌'}")
    
    if not backend_ok:
        print("\n💡 Backend Issues:")
        print("   - Make sure the backend is running: uvicorn main:app --reload")
        print("   - Check if port 8000 is available")
        
    if not ollama_ok:
        print("\n💡 Ollama Issues:")
        print("   - Make sure Ollama is installed and running")
        print("   - Try: ollama serve")
        print("   - Pull a model: ollama pull mistral:7b-instruct-q4_0")

if __name__ == "__main__":
    main()