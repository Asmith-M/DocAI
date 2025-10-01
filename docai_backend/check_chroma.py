# check_chroma.py

import chromadb

# Connect to the running Chroma server
client = chromadb.HttpClient(host='localhost', port=8000)

# --- Change this to your actual collection name ---
COLLECTION_NAME = "doc_80be622565a9484fb4da10a045d50646"
try:
    # Get the collection
    collection = client.get_collection(name=COLLECTION_NAME)

    # 1. Check the count
    count = collection.count()
    print(f"✅ Success! Connected to collection '{COLLECTION_NAME}'.")
    print(f"   Item count: {count}")
    print("-" * 20)

    # 2. Get the first few items to confirm embeddings are stored
    if count > 0:
        results = collection.get(
            limit=3,
            include=['embeddings', 'documents']
        )
        print("🔍 Retrieving first 3 items:")
        # Pretty print the results
        for i, doc_id in enumerate(results['ids']):
            print(f"  - ID: {doc_id}")
            print(f"    Document: {results['documents'][i]}")
            # Show the first few numbers of the embedding vector
            embedding_preview = results['embeddings'][i][:5]
            print(f"    Embedding (first 5 dims): {embedding_preview}...")
        print("\n✨ Embeddings are being stored correctly.")
    else:
        print("Collection is empty. No items to display.")

except Exception as e:
    print(f"❌ An error occurred: {e}")
    print("   Please check if your collection name is correct and the server is running.")