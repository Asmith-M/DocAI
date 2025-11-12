#!/usr/bin/env python3
"""
DocAI Offline Status Validation Tests
Tests the offline status endpoint and related functionality
"""

import pytest
import requests
import json
import time
from typing import Dict, Any


class TestOfflineStatus:
    """Test suite for offline status functionality"""

    BASE_URL = "http://localhost:8000"

    def test_offline_status_endpoint(self):
        """Test the offline status endpoint returns valid data"""
        response = requests.get(f"{self.BASE_URL}/api/admin/offline/status")

        assert response.status_code == 200
        data = response.json()

        # Check required fields
        assert "ollama" in data
        assert "embedding_service" in data
        assert "chroma" in data
        assert "ocr" in data

        # Validate ollama status structure
        ollama = data["ollama"]
        assert "healthy" in ollama
        assert "model_loaded" in ollama
        assert "model_name" in ollama

        # Validate embedding service structure
        embedding = data["embedding_service"]
        assert "model_loaded" in embedding
        assert "model_path" in embedding

        # Validate chroma structure
        chroma = data["chroma"]
        assert "chroma_persist_dir_exists" in chroma
        assert "chroma_host" in chroma

        # Validate OCR structure
        ocr = data["ocr"]
        assert any(key in ocr for key in ["pymupdf_available", "tesseract_available", "easyocr_available"])

    def test_offline_readiness_endpoint(self):
        """Test the offline readiness endpoint"""
        response = requests.get(f"{self.BASE_URL}/api/admin/offline/readiness")

        assert response.status_code == 200
        data = response.json()

        assert "ready" in data
        assert isinstance(data["ready"], bool)

        if data["ready"]:
            assert "message" in data
            assert "All offline components are ready" in data["message"]
        else:
            assert "issues" in data
            assert isinstance(data["issues"], list)

    def test_offline_status_detailed(self):
        """Test detailed offline status information"""
        response = requests.get(f"{self.BASE_URL}/api/admin/offline/status")
        data = response.json()

        # Test Ollama detailed status
        ollama = data["ollama"]
        if ollama["healthy"]:
            assert ollama["model_loaded"] is not None
            assert isinstance(ollama["model_name"], str)

        # Test embedding service detailed status
        embedding = data["embedding_service"]
        if embedding["model_loaded"]:
            assert embedding["model_path"] is not None
            assert isinstance(embedding["model_path"], str)

        # Test Chroma detailed status
        chroma = data["chroma"]
        assert isinstance(chroma["chroma_persist_dir_exists"], bool)
        assert isinstance(chroma["chroma_host"], str)

    def test_offline_status_performance(self):
        """Test that offline status responds quickly"""
        start_time = time.time()
        response = requests.get(f"{self.BASE_URL}/api/admin/offline/status")
        end_time = time.time()

        assert response.status_code == 200
        assert (end_time - start_time) < 2.0  # Should respond within 2 seconds

    def test_offline_status_consistency(self):
        """Test that multiple calls return consistent results"""
        results = []

        for _ in range(3):
            response = requests.get(f"{self.BASE_URL}/api/admin/offline/status")
            assert response.status_code == 200
            results.append(response.json())
            time.sleep(0.1)

        # All results should be identical
        assert results[0] == results[1] == results[2]

    def test_offline_status_error_handling(self):
        """Test error handling when services are unavailable"""
        # This test assumes some services might be down
        response = requests.get(f"{self.BASE_URL}/api/admin/offline/status")
        assert response.status_code == 200

        data = response.json()

        # Even if services are down, the endpoint should still respond
        # and provide meaningful status information
        assert isinstance(data, dict)
        assert all(key in data for key in ["ollama", "embedding_service", "chroma", "ocr"])


def run_manual_tests():
    """Manual test function for development/debugging"""
    print("🧪 Running DocAI Offline Status Tests")
    print("=" * 50)

    base_url = "http://localhost:8000"

    try:
        # Test 1: Basic connectivity
        print("📡 Testing basic connectivity...")
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            print("- API is reachable")
        else:
            print(f"❌ API returned status {response.status_code}")
            return False

        # Test 2: Offline status
        print("🔌 Testing offline status endpoint...")
        response = requests.get(f"{base_url}/api/admin/offline/status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("- Offline status endpoint working")
            print(f"   Ollama: {'-' if data['ollama']['healthy'] else '❌'}")
            print(f"   Embeddings: {'-' if data['embedding_service']['model_loaded'] else '❌'}")
            print(f"   Chroma: {'-' if data['chroma']['chroma_persist_dir_exists'] else '❌'}")
            print(f"   OCR: {'-' if any(data['ocr'].get(k, False) for k in ['pymupdf_available', 'tesseract_available', 'easyocr_available']) else '❌'}")
        else:
            print(f"❌ Offline status endpoint failed: {response.status_code}")
            return False

        # Test 3: Readiness check
        print("- Testing readiness endpoint...")
        response = requests.get(f"{base_url}/api/admin/offline/readiness", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"- Readiness check: {'Ready' if data['ready'] else 'Not Ready'}")
            if not data['ready']:
                print(f"   Issues: {', '.join(data.get('issues', []))}")
        else:
            print(f"❌ Readiness endpoint failed: {response.status_code}")
            return False

        print("\n🎉 All tests passed!")
        return True

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to DocAI API. Make sure the server is running.")
        return False
    except requests.exceptions.Timeout:
        print("❌ Request timed out. The server might be overloaded.")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


if __name__ == "__main__":
    # Run manual tests if executed directly
    success = run_manual_tests()
    exit(0 if success else 1)
