#!/usr/bin/env python3

import sys
import os
import asyncio
import requests
import json

def check_ollama_service():
    """Check if Ollama service is running and what models are available."""
    try:
        print("🔍 Checking Ollama service...")
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            models = [model['name'] for model in data.get('models', [])]
            print(f"✅ Ollama service is running")
            print(f"📋 Available models: {models}")
            return models
        else:
            print(f"❌ Ollama service returned status {response.status_code}")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Ollama service: {e}")
        return []

def test_model_generation(model_name: str):
    """Test if a model can generate text."""
    try:
        print(f"\n🧪 Testing model: {model_name}")
        
        # Simple test prompt
        test_data = {
            "model": model_name,
            "prompt": "What is 2+2? Answer briefly.",
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
            print(f"✅ Model {model_name} is working")
            print(f"📝 Test response: {answer[:100]}...")
            return True
        else:
            print(f"❌ Model {model_name} failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error testing model {model_name}: {e}")
        return False

def test_streaming(model_name: str):
    """Test streaming generation."""
    try:
        print(f"\n🌊 Testing streaming for model: {model_name}")
        
        test_data = {
            "model": model_name,
            "prompt": "Count from 1 to 5.",
            "stream": True
        }
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=test_data,
            stream=True,
            timeout=30
        )
        
        if response.status_code == 200:
            chunks_received = 0
            full_response = ""
            
            for line in response.iter_lines():
                if line:
                    try:
                        chunk_data = json.loads(line)
                        chunk_text = chunk_data.get('response', '')
                        if chunk_text:
                            full_response += chunk_text
                            chunks_received += 1
                            
                        if chunk_data.get('done', False):
                            break
                            
                    except json.JSONDecodeError:
                        continue
            
            print(f"✅ Streaming works for {model_name}")
            print(f"📊 Received {chunks_received} chunks")
            print(f"📝 Full response: {full_response.strip()}")
            return True
        else:
            print(f"❌ Streaming failed for {model_name} with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error testing streaming for {model_name}: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Testing Ollama Models\n")
    
    # Check service
    available_models = check_ollama_service()
    
    if not available_models:
        print("\n❌ No models available or Ollama service not running")
        print("💡 Try running: ollama pull mistral:7b-instruct-q4_0")
        return
    
    # Test each model
    working_models = []
    for model in available_models:
        if test_model_generation(model):
            working_models.append(model)
            test_streaming(model)
    
    print(f"\n📊 Summary:")
    print(f"   Available models: {len(available_models)}")
    print(f"   Working models: {len(working_models)}")
    print(f"   Working models list: {working_models}")
    
    # Recommendations
    print(f"\n💡 Recommendations:")
    if "mistral:7b-instruct-q4_0" in working_models:
        print("   ✅ Use mistral:7b-instruct-q4_0 as primary model")
    elif "gemma:2b-instruct-q4_0" in working_models:
        print("   ⚠️ Use gemma:2b-instruct-q4_0 (smaller model)")
    else:
        print("   ❌ No recommended models found")
        print("   💡 Try: ollama pull mistral:7b-instruct-q4_0")

if __name__ == "__main__":
    main()