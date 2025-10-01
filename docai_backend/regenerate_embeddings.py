from app.services.embedding_service import embedding_service

document_id = '80be622565a9484fb4da10a045d50646'
success = embedding_service.generate_embeddings(document_id)
print(f"Embedding generation for {document_id}: {'Success' if success else 'Failed'}")
