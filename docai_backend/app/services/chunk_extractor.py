import os
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

log = logging.getLogger(__name__)

class ChunkExtractor:
    def __init__(self):
        self.chunks_storage = Path(os.getcwd()) / "app" / "storage" / "chunks"
        self.chunks_storage.mkdir(parents=True, exist_ok=True)

    def _split_text_into_chunks(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Split text into chunks of approximately chunk_size words with overlap.
        """
        words = text.split()
        chunks = []
        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            if end == len(words):
                break
            start = end - overlap
        return chunks

    def extract_chunks(self, document_id: str, pages_folder: Path, tables_folder: Path, extraction_method: str) -> int:
        """
        Extract chunks from text pages and table JSONs, save to chunks JSON file.
        Returns number of chunks extracted.
        """
        chunks = []
        chunk_index = 0

        # Process text pages
        if pages_folder.exists():
            for page_file in sorted(pages_folder.glob("page_*.txt")):
                page_num = int(page_file.stem.split("_")[1])
                try:
                    text = page_file.read_text(encoding="utf-8").strip()
                    if not text:
                        log.info(f"Skipping empty page {page_num} for document {document_id}")
                        continue
                    text_chunks = self._split_text_into_chunks(text)
                    for idx, chunk_text in enumerate(text_chunks):
                        if not chunk_text.strip():
                            log.info(f"Skipping empty chunk on page {page_num} index {idx} for document {document_id}")
                            continue
                        chunk_index += 1
                        chunk = {
                            "document_id": document_id,
                            "page": page_num,
                            "chunk_index": chunk_index,
                            "type": "text",
                            "extraction_method": extraction_method,
                            "text": chunk_text,
                            "created_at": datetime.utcnow().isoformat()
                        }
                        chunks.append(chunk)
                except Exception as e:
                    log.warning(f"Failed to process page {page_num} for document {document_id}: {e}")

        # Process tables
        if tables_folder.exists():
            for table_file in sorted(tables_folder.glob("*.json")):
                try:
                    table_json = json.loads(table_file.read_text(encoding="utf-8"))
                    page_num = table_json.get("page", None)
                    table_data = table_json.get("data", [])
                    # Convert table data to text representation
                    table_text = "\n".join(["\t".join(map(str, row)) for row in table_data])
                    if not table_text.strip():
                        log.info(f"Skipping empty table in file {table_file.name} for document {document_id}")
                        continue
                    chunk_index += 1
                    chunk = {
                        "document_id": document_id,
                        "page": page_num,
                        "chunk_index": chunk_index,
                        "type": "table",
                        "extraction_method": "camelot/tabula",
                        "text": table_text,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    chunks.append(chunk)
                except Exception as e:
                    log.warning(f"Failed to process table file {table_file.name} for document {document_id}: {e}")

        # Save chunks to JSON file
        if chunks:
            chunks_file = self.chunks_storage / f"{document_id}.json"
            try:
                with open(chunks_file, "w", encoding="utf-8") as f:
                    json.dump(chunks, f, indent=2)
                log.info(f"Saved {len(chunks)} chunks for document {document_id} to {chunks_file}")
            except Exception as e:
                log.error(f"Failed to save chunks for document {document_id}: {e}")
                return 0
            return len(chunks)
        else:
            log.info(f"No chunks extracted for document {document_id}")
            return 0

    def load_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """
        Load chunks JSON for a given document_id.
        """
        chunks_file = self.chunks_storage / f"{document_id}.json"
        if not chunks_file.exists():
            log.warning(f"Chunks file not found for document {document_id}")
            return []
        try:
            with open(chunks_file, "r", encoding="utf-8") as f:
                chunks = json.load(f)
            return chunks
        except Exception as e:
            log.warning(f"Failed to load chunks for document {document_id}: {e}")
            return []

# Global instance
chunk_extractor = ChunkExtractor()
