import os
import json
from typing import List, Dict, Any
from loguru import logger
from app.utils.agent_timer import log_time

from app.services.chunk_extractor import ChunkExtractor

class ChunkAgent:
    def __init__(self):
        self.chunk_extractor = ChunkExtractor()
        self.storage_path = "app/storage/chunks"

    @log_time
    def create_chunks(self, document_id: str, parsed_pages: List[Dict[str, Any]], force: bool = False) -> List[Dict[str, Any]]:
        """
        Idempotent chunking and metadata storage.
        """
        chunk_file = os.path.join(self.storage_path, f"{document_id}.json")

        if not force and os.path.exists(chunk_file):
            logger.info(f"Chunks already exist for document {document_id}, skipping")
            with open(chunk_file, 'r') as f:
                return json.load(f)

        logger.info(f"Creating chunks for document {document_id}")

        all_chunks = []
        for page_data in parsed_pages:
            page_num = page_data.get("page", 0)
            text = page_data.get("text", "")
            tables = page_data.get("tables", [])

            # Extract text chunks using compatibility wrapper
            text_chunks = self.chunk_extractor.extract_chunks(text, document_id, page_num)

            # Extract table chunks
            table_chunks = []
            for table in tables:
                table_text = "\n".join(["\t".join(row) for row in table.get("data", [])])
                table_chunks.extend(self.chunk_extractor.extract_chunks(table_text, document_id, page_num, chunk_type="table"))

            all_chunks.extend(text_chunks + table_chunks)

        # Save to file
        os.makedirs(self.storage_path, exist_ok=True)
        with open(chunk_file, 'w') as f:
            json.dump(all_chunks, f, indent=2)

        logger.info(f"Created {len(all_chunks)} chunks for document {document_id}")
        return all_chunks
