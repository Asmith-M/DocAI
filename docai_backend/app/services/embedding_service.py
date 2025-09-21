import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import numpy as np
from datetime import datetime
from app.core.config import settings

log = logging.getLogger(__name__)

# Set Hugging Face offline mode
os.environ['HF_HOME'] = settings.HF_HOME
os.environ['TRANSFORMERS_OFFLINE'] = settings.TRANSFORMERS_OFFLINE
os.environ['HF_DATASETS_OFFLINE'] = settings.HF_DATASETS_OFFLINE

class EmbeddingService:
    def __init__(self):
        self.chunks_storage = Path(os.getcwd()) / "app" / "storage" / "chunks"
        self.chroma_storage = Path(settings.CHROMA_PERSIST_DIR)
        self.chroma_storage.mkdir(parents=True, exist_ok=True)

        # Initialize ChromaDB client with persistence
        self.chroma_client = chromadb.PersistentClient(
            path=str(self.chroma_storage),
            settings=Settings(anonymized_telemetry=False)
        )

        # Initialize sentence transformer model
        try:
            if settings.EMBEDDING_MODEL_PATH:
                # Use local model path
                model_path = Path(settings.EMBEDDING_MODEL_PATH)
                if not model_path.exists():
                    raise FileNotFoundError(f"Embedding model path not found: {model_path}")
                self.model = SentenceTransformer(str(model_path))
                log.info(f"Sentence transformer model loaded from local path: {model_path}")
            else:
                # Use default model name (will attempt download if not cached)
                self.model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
                log.info(f"Sentence transformer model loaded: {settings.EMBEDDING_MODEL_NAME}")

            # Log model dimensions for verification
            sample_embedding = self.model.encode(["test"], convert_to_numpy=True)
            log.info(f"Model embedding dimensions: {sample_embedding.shape[1]}")

        except Exception as e:
            error_msg = f"Failed to load sentence transformer model: {e}"
            if settings.EMBEDDING_MODEL_PATH:
                error_msg += f"\nPlease ensure the model files are present at: {settings.EMBEDDING_MODEL_PATH}"
            else:
                error_msg += f"\nPlease set EMBEDDING_MODEL_PATH to a local model directory or ensure {settings.EMBEDDING_MODEL_NAME} is cached."
            log.error(error_msg)
            raise RuntimeError(error_msg)

        # Track embedding status per document
        self.embedding_status = {}

    def _get_collection_name(self, document_id: str) -> str:
        """Generate collection name for document"""
        return f"doc_{document_id}"

    def _load_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """Load chunks for a document"""
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

    def _generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a list of texts"""
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings
        except Exception as e:
            log.error(f"Failed to generate embeddings: {e}")
            raise

    def _create_collection(self, document_id: str):
        """Create or get ChromaDB collection for document"""
        collection_name = self._get_collection_name(document_id)
        try:
            collection = self.chroma_client.get_or_create_collection(
                name=collection_name,
                metadata={"document_id": document_id, "created_at": datetime.utcnow().isoformat()}
            )
            return collection
        except Exception as e:
            log.error(f"Failed to create/get collection for document {document_id}: {e}")
            raise

    def generate_embeddings(self, document_id: str) -> bool:
        """
        Generate embeddings for all chunks of a document and store in ChromaDB.
        Returns True if successful, False otherwise.
        """
        try:
            # Update status to processing
            self.embedding_status[document_id] = {
                "status": "processing",
                "progress": 0,
                "total_chunks": 0,
                "processed_chunks": 0,
                "errors": [],
                "started_at": datetime.utcnow().isoformat()
            }

            # Load chunks
            chunks = self._load_chunks(document_id)
            if not chunks:
                self.embedding_status[document_id] = {
                    "status": "failed",
                    "error": "No chunks found for document",
                    "completed_at": datetime.utcnow().isoformat()
                }
                return False

            total_chunks = len(chunks)
            self.embedding_status[document_id]["total_chunks"] = total_chunks

            # Create collection
            collection = self._create_collection(document_id)

            # Process chunks in batches
            batch_size = 10
            processed_chunks = 0
            valid_chunks = []

            for i in range(0, total_chunks, batch_size):
                batch = chunks[i:i + batch_size]
                batch_texts = []
                batch_metadata = []
                batch_ids = []

                for chunk in batch:
                    try:
                        text = chunk.get("text", "").strip()
                        if not text:
                            log.warning(f"Skipping empty chunk {chunk.get('chunk_index')} for document {document_id}")
                            continue

                        batch_texts.append(text)
                        batch_metadata.append({
                            "document_id": chunk.get("document_id"),
                            "page": chunk.get("page"),
                            "chunk_index": chunk.get("chunk_index"),
                            "type": chunk.get("type"),
                            "extraction_method": chunk.get("extraction_method"),
                            "created_at": chunk.get("created_at")
                        })
                        batch_ids.append(f"{document_id}_{chunk.get('chunk_index')}")

                    except Exception as e:
                        error_msg = f"Error processing chunk {chunk.get('chunk_index')}: {str(e)}"
                        log.warning(error_msg)
                        self.embedding_status[document_id]["errors"].append(error_msg)
                        continue

                if batch_texts:
                    try:
                        # Generate embeddings for batch
                        embeddings = self._generate_embeddings(batch_texts)

                        # Add to collection
                        collection.add(
                            embeddings=embeddings.tolist(),
                            documents=batch_texts,
                            metadatas=batch_metadata,
                            ids=batch_ids
                        )

                        processed_chunks += len(batch_texts)
                        self.embedding_status[document_id]["processed_chunks"] = processed_chunks
                        self.embedding_status[document_id]["progress"] = (processed_chunks / total_chunks) * 100

                        log.info(f"Processed {processed_chunks}/{total_chunks} chunks for document {document_id}")

                    except Exception as e:
                        error_msg = f"Error processing batch {i//batch_size + 1}: {str(e)}"
                        log.error(error_msg)
                        self.embedding_status[document_id]["errors"].append(error_msg)
                        # Continue with next batch

            # Update final status
            if processed_chunks > 0:
                self.embedding_status[document_id].update({
                    "status": "completed",
                    "progress": 100,
                    "completed_at": datetime.utcnow().isoformat()
                })
                log.info(f"Successfully generated embeddings for {processed_chunks} chunks of document {document_id}")
                return True
            else:
                self.embedding_status[document_id].update({
                    "status": "failed",
                    "error": "No chunks were successfully processed",
                    "completed_at": datetime.utcnow().isoformat()
                })
                return False

        except Exception as e:
            error_msg = f"Failed to generate embeddings for document {document_id}: {str(e)}"
            log.error(error_msg)
            self.embedding_status[document_id] = {
                "status": "failed",
                "error": error_msg,
                "completed_at": datetime.utcnow().isoformat()
            }
            return False

    def get_embedding_status(self, document_id: str) -> Dict[str, Any]:
        """Get embedding status for a document"""
        return self.embedding_status.get(document_id, {
            "status": "not_started",
            "message": "Embedding generation not started for this document"
        })

    def search_similar(self, document_id: str, query: str, n_results: int = 5) -> Dict[str, Any]:
        """
        Search for similar chunks in the document's embedding space.
        Returns top n_results similar chunks with metadata.
        """
        try:
            collection = self.chroma_client.get_collection(self._get_collection_name(document_id))

            # Generate embedding for query
            query_embedding = self.model.encode([query], convert_to_numpy=True)[0]

            # Search
            results = collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=n_results,
                include=['documents', 'metadatas', 'distances']
            )

            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        "text": doc,
                        "metadata": results['metadatas'][0][i] if results['metadatas'] and results['metadatas'][0] else {},
                        "distance": results['distances'][0][i] if results['distances'] and results['distances'][0] else None
                    })

            return {
                "query": query,
                "results": formatted_results,
                "total_results": len(formatted_results)
            }

        except Exception as e:
            log.error(f"Failed to search similar chunks for document {document_id}: {e}")
            return {
                "query": query,
                "results": [],
                "error": str(e)
            }

    def delete_embeddings(self, document_id: str) -> bool:
        """Delete embeddings for a document"""
        try:
            collection_name = self._get_collection_name(document_id)
            self.chroma_client.delete_collection(collection_name)
            if document_id in self.embedding_status:
                del self.embedding_status[document_id]
            log.info(f"Deleted embeddings for document {document_id}")
            return True
        except Exception as e:
            log.error(f"Failed to delete embeddings for document {document_id}: {e}")
            return False

# Global instance
embedding_service = EmbeddingService()
