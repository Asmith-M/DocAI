# download_hf_models.py
from huggingface_hub import snapshot_download
models = [
    "Helsinki-NLP/opus-mt-en-hi",
    "Helsinki-NLP/opus-mt-hi-en",
    "Helsinki-NLP/opus-mt-en-mr",
    "Helsinki-NLP/opus-mt-mr-en",
]

# Location where model snapshots will be stored
out_cache = r"C:\hf_offline_cache"

for m in models:
    print(f"Downloading {m} ...")
    path = snapshot_download(repo_id=m, cache_dir=out_cache, repo_type="model")
    print(f"Saved {m} -> {path}")
print("All downloads complete.")
