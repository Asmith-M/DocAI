# delete_all_collections.py

import chromadb

# Connect to the running Chroma server
client = chromadb.HttpClient(host='localhost', port=8000)

try:
    # Get a list of all collections
    collections = client.list_collections()

    if not collections:
        print("✅ No collections found to delete.")
    else:
        print("The following collections will be PERMANENTLY DELETED:")
        for collection in collections:
            print(f"  - {collection.name}")
        
        # Safety confirmation prompt
        confirm = input("\n> Are you sure you want to proceed? (yes/no): ")

        if confirm.lower() == 'yes':
            print("\nDeleting collections...")
            for collection in collections:
                client.delete_collection(name=collection.name)
                print(f"  Deleted '{collection.name}'")
            print("\n✅ All collections have been deleted.")
        else:
            print("\n❌ Deletion cancelled.")

except Exception as e:
    print(f"\nAn error occurred: {e}")