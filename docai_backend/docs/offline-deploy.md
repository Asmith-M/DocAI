# DocAI Offline Deployment Guide

This guide provides comprehensive instructions for deploying DocAI in completely offline environments without internet connectivity.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [Model Import](#model-import)
5. [Docker Deployment](#docker-deployment)
6. [Systemd Service](#systemd-service)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)

## System Requirements

### Hardware Requirements

| Tier | RAM | Storage | CPU | Use Case |
|------|-----|---------|-----|----------|
| **Minimum** | 4GB | 50GB | 2-4 cores | Basic functionality, Gemma 2B |
| **Recommended** | 8GB | 100GB | 4+ cores | Good performance, quantized models |
| **Production** | 16GB+ | 200GB+ | 8+ cores | Full performance, multiple users |

### Software Requirements

- **Operating System**: Ubuntu 20.04+, Debian 11+, or RHEL 8+
- **Python**: 3.8 or higher
- **Docker**: 20.10+ (for containerized deployment)
- **System Dependencies**:
  - Tesseract OCR
  - curl
  - lsof

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd docai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Import Models (Online Phase)

```bash
# Download all required models
bash deploy/offline/import_models.sh
```

### 3. Start Services

```bash
# Start with Docker (recommended)
docker-compose -f docker-compose.offline.yml up -d

# Or start directly
python main.py
```

### 4. Verify Installation

```bash
# Check system readiness
bash scripts/check_offline_readiness.sh

# Check API status
curl http://localhost:8000/api/admin/offline/status
```

## Detailed Installation

### Step 1: System Preparation

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install system dependencies
sudo apt install -y \
    python3-pip \
    python3-venv \
    tesseract-ocr \
    tesseract-ocr-eng \
    curl \
    lsof \
    git

# Install Docker (optional, for containerized deployment)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### RHEL/CentOS
```bash
# Install EPEL repository
sudo dnf install -y epel-release

# Install system dependencies
sudo dnf install -y \
    python3-pip \
    tesseract \
    curl \
    lsof \
    git

# Install Docker (optional)
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable --now docker
```

### Step 2: Application Setup

```bash
# Clone repository
git clone <your-repo-url>
cd docai

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
mkdir -p uploaded_docs chroma_db models hf_cache logs
```

### Step 3: Environment Configuration

Create `.env` file with offline settings:

```bash
cat > .env << 'EOF'
# Offline Configuration
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
```

## Model Import

### Online Phase (Requires Internet)

Run the model import script to download all required models:

```bash
# Ensure Ollama is installed and running
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve

# Run model import script
bash deploy/offline/import_models.sh
```

This script will:
- Download Ollama models (Gemma 2B, Mistral 7B quantized)
- Download embedding models
- Configure offline environment variables
- Create model manifest

### Model Storage Structure

After import, your models directory will contain:

```
models/
├── manifest.json
├── embedding-models/
│   └── all-MiniLM-L6-v2/
│       ├── config.json
│       ├── pytorch_model.bin
│       └── tokenizer.json
└── ollama-models/ (stored in ~/.ollama)
```

## Docker Deployment

### Build and Run

```bash
# Build the image
docker build -t docai-offline .

# Run with docker-compose
docker-compose -f docker-compose.offline.yml up -d

# Or run standalone
docker run -p 8000:8000 \
  -v $(pwd)/uploaded_docs:/app/uploaded_docs \
  -v $(pwd)/chroma_db:/app/chroma_db \
  -v $(pwd)/models:/app/models:ro \
  -e OFFLINE_MODE=true \
  docai-offline
```

### Docker Compose Services

The `docker-compose.offline.yml` includes:

- **docai-backend**: Main application service
- **ollama**: Local LLM service
- **chroma**: Vector database service

### Offline Docker Build

For completely air-gapped environments:

```bash
# 1. Pre-pull base images on internet-connected machine
docker pull python:3.11-slim
docker pull ollama/ollama:latest
docker pull chromadb/chroma:latest

# 2. Save images to tar files
docker save python:3.11-slim > python-3.11-slim.tar
docker save ollama/ollama:latest > ollama.tar
docker save chromadb/chroma:latest > chroma.tar

# 3. Transfer tar files to offline environment
# 4. Load images on offline machine
docker load < python-3.11-slim.tar
docker load < ollama.tar
docker load < chroma.tar

# 5. Build application image
docker build -t docai-offline .
```

## Systemd Service

### Installation

```bash
# Copy service file
sudo cp deploy/docai.service /etc/systemd/system/

# Create system user
sudo useradd --system --create-home --shell /bin/bash docai

# Set up application directory
sudo mkdir -p /opt/docai
sudo cp -r . /opt/docai/
sudo chown -R docai:docai /opt/docai

# Create virtual environment
sudo -u docai python3 -m venv /opt/docai/venv
sudo -u docai /opt/docai/venv/bin/pip install -r /opt/docai/requirements.txt

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable docai
sudo systemctl start docai
```

### Service Management

```bash
# Check status
sudo systemctl status docai

# View logs
sudo journalctl -u docai -f

# Restart service
sudo systemctl restart docai

# Stop service
sudo systemctl stop docai
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OFFLINE_MODE` | `true` | Enable offline mode |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama service URL |
| `OLLAMA_MODEL` | `gemma:2b` | Default model |
| `EMBEDDING_MODEL_PATH` | `./models/...` | Local embedding model path |
| `CHROMA_PERSIST_DIR` | `./chroma_db` | ChromaDB persistence directory |
| `TESSERACT_CMD` | `tesseract` | Tesseract binary path |

### Model Selection

Choose appropriate models based on hardware:

```bash
# Low-spec hardware (4GB RAM)
export OLLAMA_MODEL=gemma:2b

# Standard hardware (8GB RAM)
export OLLAMA_MODEL=mistral:7b-instruct-q4_0

# High-end hardware (16GB+ RAM)
export OLLAMA_MODEL=mistral:7b-instruct-q5_0
```

## Troubleshooting

### Common Issues

#### 1. Ollama Service Not Starting
```bash
# Check if port 11434 is in use
lsof -i :11434

# Kill conflicting process
sudo kill -9 <PID>

# Start Ollama manually
ollama serve
```

#### 2. Model Download Failures
```bash
# Check available disk space
df -h

# Check internet connectivity
ping -c 3 google.com

# Retry model import
bash deploy/offline/import_models.sh
```

#### 3. OCR Not Working
```bash
# Check Tesseract installation
tesseract --version

# Install language packs
sudo apt install -y tesseract-ocr-eng

# Check TESSDATA_PREFIX
echo $TESSDATA_PREFIX
```

#### 4. Embedding Model Issues
```bash
# Verify model path
ls -la models/embedding-models/all-MiniLM-L6-v2/

# Test model loading
python3 -c "
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('models/embedding-models/all-MiniLM-L6-v2')
print('Model loaded successfully')
"
```

### Health Checks

#### System Readiness
```bash
bash scripts/check_offline_readiness.sh
```

#### API Endpoints
```bash
# Health check
curl http://localhost:8000/api/health

# Offline status
curl http://localhost:8000/api/admin/offline/status

# Readiness check
curl http://localhost:8000/api/admin/offline/readiness
```

### Log Analysis

```bash
# Application logs
tail -f logs/docai.log

# Systemd logs
sudo journalctl -u docai -f

# Docker logs
docker-compose -f docker-compose.offline.yml logs -f
```

## Security Considerations

### Network Isolation

1. **Firewall Configuration**:
```bash
# Allow only necessary ports
sudo ufw allow 8000/tcp
sudo ufw allow 11434/tcp  # Ollama
sudo ufw allow 8001/tcp  # ChromaDB

# Deny all other incoming connections
sudo ufw default deny incoming
sudo ufw enable
```

2. **API Access Control**:
```bash
# Add API key authentication to admin endpoints
# Configure SECRET_KEY in .env
echo "SECRET_KEY=your-secure-random-key-here" >> .env
```

### Data Encryption

1. **Disk Encryption**:
```bash
# Use LUKS for model storage
sudo apt install cryptsetup
sudo cryptsetup luksFormat /dev/sdX
sudo cryptsetup luksOpen /dev/sdX encrypted_models
sudo mkfs.ext4 /dev/mapper/encrypted_models
```

2. **File Permissions**:
```bash
# Restrict access to model files
chmod 750 models/
chown -R docai:docai models/
```

### User Management

```bash
# Create dedicated user
sudo useradd --system --create-home --shell /bin/bash docai

# Set up sudo access for administration
sudo usermod -aG sudo docai
echo "docai ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart docai" | sudo tee /etc/sudoers.d/docai
```

## Performance Tuning

### Memory Optimization

```bash
# Set memory limits in systemd service
MemoryLimit=4G
MemorySwapMax=1G

# Configure Ollama memory usage
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_MAX_QUEUE=5
```

### Kernel Tuning

```bash
# Add to /etc/sysctl.conf
vm.swappiness=10
vm.dirty_ratio=5
vm.dirty_background_ratio=2

# Apply changes
sudo sysctl -p
```

### Storage Optimization

```bash
# Use faster storage for ChromaDB
# Mount SSD for chroma_db directory
echo "/dev/nvme0n1 /opt/docai/chroma_db ext4 defaults,noatime 0 2" | sudo tee -a /etc/fstab
```

## Backup and Recovery

### Database Backup

```bash
# Backup ChromaDB
tar -czf chroma_backup_$(date +%Y%m%d_%H%M%S).tar.gz chroma_db/

# Backup uploaded documents
tar -czf docs_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploaded_docs/
```

### Model Backup

```bash
# Backup all models
tar -czf models_backup_$(date +%Y%m%d_%H%M%S).tar.gz models/

# Backup Ollama models
cp -r ~/.ollama ollama_backup/
```

### Recovery Process

```bash
# Restore from backup
tar -xzf chroma_backup_*.tar.gz
tar -xzf models_backup_*.tar.gz
cp -r ollama_backup/* ~/.ollama/
```

## Monitoring and Maintenance

### System Monitoring

```bash
# Monitor resource usage
htop

# Check disk usage
df -h
du -sh *

# Monitor logs
tail -f logs/docai.log
```

### Regular Maintenance

```bash
# Clean up old logs
find logs/ -name "*.log" -mtime +30 -delete

# Optimize ChromaDB
curl -X POST http://localhost:8000/api/admin/chroma/optimize

# Check system health
bash scripts/check_offline_readiness.sh
```

## Support and Updates

### Offline Updates

1. **Download updates on connected machine**
2. **Transfer via USB/network drive**
3. **Apply updates in offline environment**

### Getting Help

1. **Check logs**: `tail -f logs/docai.log`
2. **Run diagnostics**: `bash scripts/check_offline_readiness.sh`
3. **Check API status**: `curl http://localhost:8000/api/admin/offline/status`

### Common Solutions

- **High memory usage**: Switch to smaller models (gemma:2b)
- **Slow responses**: Check disk I/O and CPU usage
- **OCR failures**: Verify Tesseract installation and language packs
- **Model errors**: Re-run model import script

---

For additional support, consult the troubleshooting section or check the application logs for detailed error messages.
