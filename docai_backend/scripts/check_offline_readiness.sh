#!/bin/bash

# DocAI Offline Readiness Check Script
# This script performs pre-flight checks for offline deployment

set -e  # Exit on any error

echo "🔍 DocAI Offline Readiness Check"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}- $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to check if command exists
check_command() {
    if command -v $1 >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check if service is running
check_service() {
    if curl -s -f $1 >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check 1: Python version
echo -n "Checking Python version... "
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.8"
if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then
    print_status 0 "Python $python_version"
else
    print_status 1 "Python $python_version (requires >= $required_version)"
fi

# Check 2: Required Python packages
echo -n "Checking Python packages... "
python3 -c "
import sys
required = ['fastapi', 'uvicorn', 'python-dotenv', 'pydantic', 'PyMuPDF', 'pytesseract', 'easyocr', 'sentence-transformers', 'chromadb', 'ollama']
missing = []
for pkg in required:
    try:
        __import__(pkg.replace('-', '_'))
    except ImportError:
        missing.append(pkg)
if missing:
    print('Missing:', ', '.join(missing))
    sys.exit(1)
else:
    print('All packages installed')
" 2>/dev/null && print_status 0 "All Python packages installed" || print_status 1 "Missing Python packages"

# Check 3: Ollama service
echo -n "Checking Ollama service... "
if check_service "http://localhost:11434/api/tags"; then
    print_status 0 "Ollama service running"
else
    print_status 1 "Ollama service not running"
fi

# Check 4: Ollama model availability
echo -n "Checking Ollama models... "
if curl -s "http://localhost:11434/api/tags" | grep -q "gemma\|mistral\|llama"; then
    print_status 0 "Ollama models available"
else
    print_status 1 "No compatible models found in Ollama"
fi

# Check 5: Tesseract OCR
echo -n "Checking Tesseract OCR... "
if check_command tesseract; then
    tesseract_version=$(tesseract --version 2>/dev/null | head -n1 | awk '{print $2}')
    print_status 0 "Tesseract $tesseract_version"
else
    print_status 1 "Tesseract not installed"
fi

# Check 6: ChromaDB directory
echo -n "Checking ChromaDB persistence... "
chroma_dir="./chroma_db"
if [ -d "$chroma_dir" ]; then
    print_status 0 "ChromaDB directory exists"
else
    print_status 1 "ChromaDB directory not found"
fi

# Check 7: Environment file
echo -n "Checking environment configuration... "
if [ -f ".env" ]; then
    if grep -q "OLLAMA_HOST\|EMBEDDING_MODEL_PATH\|CHROMA_PERSIST_DIR" .env; then
        print_status 0 "Environment file configured"
    else
        print_status 1 "Environment file missing required variables"
    fi
else
    print_status 1 "Environment file not found"
fi

# Check 8: Disk space
echo -n "Checking disk space... "
free_space=$(df . | tail -1 | awk '{print $4}')
free_space_gb=$((free_space / 1024 / 1024))
if [ $free_space_gb -gt 5 ]; then
    print_status 0 "Sufficient disk space (${free_space_gb}GB)"
else
    print_status 1 "Insufficient disk space (${free_space_gb}GB, need >5GB)"
fi

# Check 9: Memory
echo -n "Checking available memory... "
total_mem=$(grep MemTotal /proc/meminfo | awk '{print $2}')
total_mem_gb=$((total_mem / 1024 / 1024))
if [ $total_mem_gb -gt 4 ]; then
    print_status 0 "Sufficient memory (${total_mem_gb}GB)"
else
    print_status 1 "Insufficient memory (${total_mem_gb}GB, need >4GB)"
fi

# Check 10: Port availability
echo -n "Checking port availability... "
if lsof -i :8000 >/dev/null 2>&1; then
    print_status 1 "Port 8000 already in use"
else
    print_status 0 "Port 8000 available"
fi

echo ""
echo "- Summary:"
echo "=========="

# Overall assessment
failed_checks=0
if [ ! -f ".env" ]; then failed_checks=$((failed_checks+1)); fi
if ! check_service "http://localhost:11434/api/tags" 2>/dev/null; then failed_checks=$((failed_checks+1)); fi
if ! check_command tesseract; then failed_checks=$((failed_checks+1)); fi
if [ ! -d "./chroma_db" ]; then failed_checks=$((failed_checks+1)); fi
if [ $free_space_gb -le 5 ]; then failed_checks=$((failed_checks+1)); fi
if [ $total_mem_gb -le 4 ]; then failed_checks=$((failed_checks+1)); fi
if lsof -i :8000 >/dev/null 2>&1; then failed_checks=$((failed_checks+1)); fi

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! System is ready for offline deployment.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  $failed_checks check(s) failed. Please address the issues above before deployment.${NC}"
    echo ""
    echo "🔧 Quick fixes:"
    echo "1. Install missing dependencies: pip install -r requirements.txt"
    echo "2. Start Ollama: ollama serve"
    echo "3. Pull a model: ollama pull gemma:2b"
    echo "4. Install Tesseract: sudo apt-get install tesseract-ocr (Ubuntu/Debian)"
    echo "5. Create .env file with required environment variables"
    exit 1
fi
