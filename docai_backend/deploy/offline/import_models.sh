#!/bin/bash

# DocAI Offline Model Import Script
# This script downloads and sets up all required models for offline deployment

set -e  # Exit on any error

echo "🤖 DocAI Offline Model Import"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MODELS_DIR="./models"
HF_CACHE_DIR="./hf_cache"
OLLAMA_MODELS=("gemma:2b" "mistral:7b-instruct-q4_0")
EMBEDDING_MODELS=("sentence-transformers/all-MiniLM-L6-v2")

# Create directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p "$MODELS_DIR"
mkdir -p "$HF_CACHE_DIR"
mkdir -p "$MODELS_DIR/embedding-models"

# Function to check if command exists
check_command() {
    if ! command -v $1 >/dev/null 2>&1; then
        echo -e "${RED}❌ $1 is not installed. Please install it first.${NC}"
        exit 1
    fi
}

# Function to download with progress
download_with_progress() {
    local url=$1
    local output=$2
    echo -e "${BLUE}📥 Downloading $output...${NC}"
    curl -L -o "$output" "$url" || {
        echo -e "${RED}❌ Failed to download $output${NC}"
        return 1
    }
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
check_command "ollama"
check_command "curl"
check_command "python3"

# Check available disk space
echo -e "${BLUE}💾 Checking disk space...${NC}"
free_space=$(df . | tail -1 | awk '{print $4}')
free_space_gb=$((free_space / 1024 / 1024))
echo "Available space: ${free_space_gb}GB"

if [ $free_space_gb -lt 10 ]; then
    echo -e "${YELLOW}⚠️  Warning: Less than 10GB free space. Some models may not fit.${NC}"
fi

# Start Ollama service if not running
echo -e "${BLUE}🚀 Starting Ollama service...${NC}"
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "Starting Ollama in background..."
    ollama serve &
    OLLAMA_PID=$!
    sleep 5

    # Check if Ollama started successfully
    if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo -e "${RED}❌ Failed to start Ollama service${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Ollama service started${NC}"
else
    echo -e "${GREEN}✅ Ollama service already running${NC}"
fi

# Download Ollama models
echo -e "${BLUE}🧠 Downloading Ollama models...${NC}"
for model in "${OLLAMA_MODELS[@]}"; do
    echo -e "${YELLOW}📥 Pulling $model...${NC}"
    if ollama pull "$model"; then
        echo -e "${GREEN}✅ Successfully pulled $model${NC}"
    else
        echo -e "${RED}❌ Failed to pull $model${NC}"
        exit 1
    fi
done

# Download embedding models
echo -e "${BLUE}🔗 Downloading embedding models...${NC}"
python3 -c "
import os
os.environ['HF_HOME'] = '$HF_CACHE_DIR'
os.environ['TRANSFORMERS_OFFLINE'] = '0'  # Allow downloading initially

from sentence_transformers import SentenceTransformer
import sys

try:
    print('📥 Downloading sentence-transformers/all-MiniLM-L6-v2...')
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    model.save('$MODELS_DIR/embedding-models/all-MiniLM-L6-v2')
    print('✅ Successfully downloaded embedding model')
except Exception as e:
    print(f'❌ Failed to download embedding model: {e}')
    sys.exit(1)
"

# Set offline environment variables
echo -e "${BLUE}⚙️  Configuring offline environment...${NC}"
export HF_HOME="$HF_CACHE_DIR"
export TRANSFORMERS_OFFLINE=1
export HF_DATASETS_OFFLINE=1

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << EOF
# DocAI Offline Configuration
OFFLINE_MODE=true
ENABLE_TELEMETRY=false

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma:2b
OLLAMA_MODEL_LOW_SPEC=gemma:2b
OLLAMA_MODEL_PRODUCTION=mistral:7b-instruct-q4_0

# Embedding Configuration
EMBEDDING_MODEL_PATH=./models/embedding-models/all-MiniLM-L6-v2
EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2

# Storage Configuration
CHROMA_PERSIST_DIR=./chroma_db
UPLOAD_FOLDER=./uploaded_docs

# OCR Configuration
TESSERACT_CMD=tesseract
TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata

# Hugging Face Configuration
HF_HOME=./hf_cache
TRANSFORMERS_OFFLINE=1
HF_DATASETS_OFFLINE=1
EOF
    echo -e "${GREEN}✅ Created .env file${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Verify installation
echo -e "${BLUE}🔍 Verifying installation...${NC}"

# Test Ollama models
echo -n "Testing Ollama models... "
if curl -s "http://localhost:11434/api/tags" | grep -q "gemma\|mistral"; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

# Test embedding model
echo -n "Testing embedding model... "
python3 -c "
import sys
sys.path.append('.')
from sentence_transformers import SentenceTransformer
try:
    model = SentenceTransformer('$MODELS_DIR/embedding-models/all-MiniLM-L6-v2')
    test_embedding = model.encode('test sentence')
    print('✅')
except Exception as e:
    print('❌')
    sys.exit(1)
"

# Create model manifest
echo -e "${BLUE}📋 Creating model manifest...${NC}"
cat > "$MODELS_DIR/manifest.json" << EOF
{
  "version": "1.0.0",
  "models": {
    "ollama": [
      "gemma:2b",
      "mistral:7b-instruct-q4_0"
    ],
    "embedding": [
      "sentence-transformers/all-MiniLM-L6-v2"
    ]
  },
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "offline_ready": true
}
EOF

# Final summary
echo ""
echo -e "${GREEN}🎉 Model import completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "  • Ollama models: ${#OLLAMA_MODELS[@]} downloaded"
echo "  • Embedding models: ${#EMBEDDING_MODELS[@]} downloaded"
echo "  • Models directory: $MODELS_DIR"
echo "  • Cache directory: $HF_CACHE_DIR"
echo "  • Configuration: .env file updated"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Run: docker-compose -f docker-compose.offline.yml up"
echo "  2. Or run: python main.py"
echo "  3. Check status: curl http://localhost:8000/api/admin/offline/status"
echo ""

# Cleanup: stop background Ollama if we started it
if [ ! -z "$OLLAMA_PID" ]; then
    echo -e "${BLUE}🛑 Stopping background Ollama service...${NC}"
    kill $OLLAMA_PID 2>/dev/null || true
fi
