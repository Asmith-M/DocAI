import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.config import settings
import os
import shutil
from pathlib import Path

client = TestClient(app)

def test_clear_all_documents():
    """Test clearing all documents endpoint"""
    # Create a test document directory
    test_doc_id = "test_doc_123"
    test_dir = Path(os.getcwd()) / "app" / "storage" / "uploads" / test_doc_id
    test_dir.mkdir(parents=True, exist_ok=True)

    # Create a test file in the directory
    test_file = test_dir / "test.pdf"
    test_file.write_text("test content")

    # Verify the directory exists
    assert test_dir.exists()

    # Call the clear endpoint
    response = client.post("/api/docs/clear")

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "deleted_count" in data
    assert data["deleted_count"] >= 0

    # Verify the directory was removed
    assert not test_dir.exists()

def test_clear_documents_empty():
    """Test clearing documents when none exist"""
    # Ensure no documents exist
    uploads_dir = Path(os.getcwd()) / "app" / "storage" / "uploads"
    if uploads_dir.exists():
        shutil.rmtree(uploads_dir)

    # Call the clear endpoint
    response = client.post("/api/docs/clear")

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["deleted_count"] == 0
    assert "message" in data
