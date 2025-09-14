#!/usr/bin/env python3
"""
Test script for embeddings functionality.
This script will:
1. Process the test document to generate chunks
2. Generate embeddings for the chunks
3. Test similarity search
"""

import os
import sys
import json
from pathlib import Path
import uuid
from datetime import datetime

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.services.pdf_extractor import PDFExtractor
from app.services.table_extractor import table_extractor
from app.services.chunk_extractor import chunk_extractor
from app.services.embedding_service import embedding_service

def process_test_document():
    """Process the test document to generate chunks."""
    test_pdf_path = Path("../../uploads/test_document.pdf")

    if not test_pdf_path.exists():
        print(f"Test document not found at {test_pdf_path}")
        return None

    print(f"Processing test document: {test_pdf_path}")

    # Generate document ID
    document_id = "test_document_" + uuid.uuid4().hex[:8]
    print(f"Generated document_id: {document_id}")

    # Create document folder
    doc_folder = Path("app/storage/uploads") / document_id
    doc_folder.mkdir(parents=True, exist_ok=True)

    # Copy PDF to document folder
    pdf_copy_path = doc_folder / f"{document_id}.pdf"
    with open(test_pdf_path, "rb") as src, open(pdf_copy_path, "wb") as dst:
        dst.write(src.read())

    # Extract text
    extractor = PDFExtractor()
    extraction = extractor.extract(pdf_copy_path)

    # Save pages
    pages_folder = doc_folder / "pages"
    pages_folder.mkdir(exist_ok=True)

    for i, page_text in enumerate(extraction.get("pages", []), start=1):
        page_file = pages_folder / f"page_{i}.txt"
        page_file.write_text(page_text or "", encoding="utf-8")

    # Extract tables
    tables_folder = Path("app/storage/tables") / document_id
    tables_folder.mkdir(parents=True, exist_ok=True)

    try:
        tables_extracted = table_extractor.extract_tables(pdf_copy_path, document_id)
        print(f"Tables extracted: {tables_extracted}")
    except Exception as e:
        print(f"Table extraction failed: {e}")
        tables_extracted = 0

    # Extract chunks
    try:
        chunks_extracted = chunk_extractor.extract_chunks(
            document_id,
            pages_folder,
            tables_folder,
            extraction.get("method", "unknown")
        )
        print(f"Chunks extracted: {chunks_extracted}")
    except Exception as e:
        print(f"Chunk extraction failed: {e}")
        return None

    # Save metadata
    metadata = {
        "document_id": document_id,
        "filename": "test_document.pdf",
        "upload_time": datetime.utcnow().isoformat(),
        "page_count": extraction.get("page_count", 0),
        "extraction_method": extraction.get("method", "unknown"),
        "has_tables": tables_extracted > 0,
        "tables_extracted": tables_extracted,
        "chunks_extracted": chunks_extracted,
        "status": "processed"
    }

    metadata_path = doc_folder / "metadata.json"
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print(f"Document processed successfully. Document ID: {document_id}")
    return document_id

def test_embeddings(document_id):
    """Test embedding generation and search."""
    print(f"\n--- Testing Embeddings for document {document_id} ---")

    # Check if chunks exist
    chunks = chunk_extractor.load_chunks(document_id)
    if not chunks:
        print("No chunks found for document")
        return

    print(f"Found {len(chunks)} chunks")

    # Generate embeddings
    print("Generating embeddings...")
    success = embedding_service.generate_embeddings(document_id)

    if not success:
        print("Embedding generation failed")
        return

    print("Embeddings generated successfully")

    # Test status
    status = embedding_service.get_embedding_status(document_id)
    print(f"Embedding status: {status}")

    # Test similarity search
    print("\n--- Testing Similarity Search ---")
    test_queries = [
        "What is this document about?",
        "Tell me about the content",
        "Summary of the document"
    ]

    for query in test_queries:
        print(f"\nQuery: {query}")
        results = embedding_service.search_similar(document_id, query, n_results=3)
        if results.get("results"):
            for i, result in enumerate(results["results"], 1):
                print(f"{i}. {result['text'][:100]}... (distance: {result['distance']:.4f})")
        else:
            print("No results found")

def main():
    print("=== DocAI Embeddings Test ===\n")

    # Process test document
    document_id = process_test_document()
    if not document_id:
        print("Failed to process test document")
        return

    # Test embeddings
    test_embeddings(document_id)

    print("\n=== Test Complete ===")

if __name__ == "__main__":
    main()
