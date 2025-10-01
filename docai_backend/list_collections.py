# list_collections.py

import chromadb

# Connect to the running Chroma server
client = chromadb.HttpClient(host='localhost', port=8000)

try:
    print("🔎 Attempting to fetch all collections from the database...")
    
    collections = client.list_collections()
    
    if not collections:
        print("\n❌ No collections found in the database.")
    else:
        print("\n✅ Success! Found the following collections:")
        for collection in collections:
            # The collection object has a .name attribute
            print(f"  - {collection.name}")
            
    print("\nNow, copy the correct name and update the COLLECTION_NAME in the 'check_chroma.py' script.")

except Exception as e:
    print(f"\n❌ An error occurred: {e}")
    print("   Please make sure your Chroma server is still running in the other terminal.")