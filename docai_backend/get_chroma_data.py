import chromadb


client = chromadb.Client()

collections = client.list_collections()

if collections:
    print("Available ChromaDB collections:")
    for collection in collections:
        print(f"- {collection.name}")
else:
    print("No collections found in ChromaDB.")