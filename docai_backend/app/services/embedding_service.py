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
from app.core import config
from app.core.config import settings
import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.agents.language_detect_agent import language_detect_agent

# Ensure storage directories exist
Path(settings.CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
(Path(os.getcwd()) / "app" / "storage" / "chunks").mkdir(parents=True, exist_ok=True)
(Path(os.getcwd()) / "app" / "storage" / "tables").mkdir(parents=True, exist_ok=True)
(Path(os.getcwd()) / "app" / "storage" / "uploads").mkdir(parents=True, exist_ok=True)

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
        self.model = None
        try:
            if settings.EMBEDDING_MODEL_PATH:
                # Use local model path
                model_path = Path(settings.EMBEDDING_MODEL_PATH)
                if not model_path.exists():
                    raise FileNotFoundError(f"Embedding model path not found: {model_path}")
                self.model = SentenceTransformer(str(model_path))
                log.info(f"Sentence transformer model loaded from local path: {model_path}")
            else:
                # Try to use default model name (will attempt download if not cached)
                try:
                    self.model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
                    log.info(f"Sentence transformer model loaded: {settings.EMBEDDING_MODEL_NAME}")
                except Exception as download_error:
                    if settings.OFFLINE_MODE:
                        log.warning(f"Offline mode enabled but embedding model not available: {download_error}")
                        log.warning("Embedding functionality will be disabled until model is available")
                        log.warning("To fix this, either:")
                        log.warning("1. Download the model while online: pip install sentence-transformers && python -c \"from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')\"")
                        log.warning("2. Set EMBEDDING_MODEL_PATH to a local model directory")
                        log.warning("3. Temporarily set OFFLINE_MODE=false to download the model")
                        self.model = None
                    else:
                        raise download_error

            if self.model:
                # Log model dimensions for verification
                sample_embedding = self.model.encode(["test"], convert_to_numpy=True)
                log.info(f"Model embedding dimensions: {sample_embedding.shape[1]}")

        except Exception as e:
            if self.model is None:
                error_msg = f"Failed to load sentence transformer model: {e}"
                if settings.EMBEDDING_MODEL_PATH:
                    error_msg += f"\\nPlease ensure the model files are present at: {settings.EMBEDDING_MODEL_PATH}"
                else:
                    error_msg += f"\\nPlease set EMBEDDING_MODEL_PATH to a local model directory or ensure {settings.EMBEDDING_MODEL_NAME} is cached."
                log.error(error_msg)
                # Don't raise exception during initialization - allow the service to start without embeddings
                log.warning("Embedding service will continue without model - embedding functionality will be disabled")
            else:
                log.warning(f"Embedding model loading failed but continuing without embeddings: {e}")

        # Track embedding status per document
        self.embedding_status = {}

        # ThreadPoolExecutor for running blocking calls asynchronously
        self.executor = ThreadPoolExecutor(max_workers=4)

        # Cache for search results: key = (document_id, query), value = results
        self.search_cache = {}

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
        if self.model is None:
            raise RuntimeError("Embedding model not available. Please configure EMBEDDING_MODEL_PATH or download the model.")
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
                        # Detect language for chunk
                        chunk_lang = language_detect_agent.detect_lang(text)
                        batch_metadata.append({
                            "document_id": chunk.get("document_id"),
                            "page": chunk.get("page"),
                            "chunk_index": chunk.get("chunk_index"),
                            "type": chunk.get("type"),
                            "extraction_method": chunk.get("extraction_method"),
                            "created_at": chunk.get("created_at"),
                            "lang": chunk_lang
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

    def ensure_embeddings_exist(self, document_id: str) -> bool:
        """
        Ensure embeddings exist for a document. If not, attempt to generate them.
        Returns True if embeddings are available, False otherwise.
        """
        status = self.get_embedding_status(document_id)
        if status["status"] == "completed":
            return True
        elif status["status"] == "processing":
            log.info(f"Embeddings are currently being processed for document {document_id}")
            return False
        else:
            log.info(f"Embeddings not available for document {document_id}, attempting to generate")
            return self.generate_embeddings(document_id)

    async def search_similar(self, document_id: str, query: str, n_results: int = 5, lang: str = None) -> Dict[str, Any]:
        """
        Async search for similar chunks in the document's embedding space.
        Returns top n_results similar chunks with metadata.
        Uses thread pool to run blocking ChromaDB calls asynchronously.
        Caches results to reduce repeated queries.
        If lang is specified, filters results to chunks with matching language.
        """
        cache_key = (document_id, query, n_results, lang)
        if cache_key in self.search_cache:
            log.info(f"Cache hit for search_similar: {cache_key}")
            return self.search_cache[cache_key]

        def blocking_search():
            if self.model is None:
                raise RuntimeError("Embedding model not available. Cannot perform similarity search.")

            collection = self.chroma_client.get_collection(self._get_collection_name(document_id))

            # Generate embedding for query
            query_embedding = self.model.encode([query], convert_to_numpy=True)[0]

            # Search with higher n_results if filtering by language
            search_n_results = n_results * 3 if lang else n_results  # Get more results to filter

            # Search
            results = collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=search_n_results,
                include=['documents', 'metadatas', 'distances']
            )
            return results

        loop = asyncio.get_event_loop()
        try:
            results = await loop.run_in_executor(self.executor, blocking_search)
        except Exception as e:
            log.error(f"Failed to search similar chunks for document {document_id}: {e}")
            return {
                "query": query,
                "results": [],
                "error": str(e)
            }

        # Format and filter results
        formatted_results = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                metadata = results['metadatas'][0][i] if results['metadatas'] and results['metadatas'][0] else {}
                chunk_lang = metadata.get('lang', 'en')

                # Filter by language if specified
                if lang and chunk_lang != lang:
                    continue

                formatted_results.append({
                    "text": doc,
                    "metadata": metadata,
                    "distance": results['distances'][0][i] if results['distances'] and results['distances'][0] else None
                })

                # Stop if we have enough results
                if len(formatted_results) >= n_results:
                    break

        result = {
            "query": query,
            "results": formatted_results,
            "total_results": len(formatted_results)
        }

        # Cache the results
        self.search_cache[cache_key] = result

        return result

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
