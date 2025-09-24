# DocAI Setup Guide

This guide provides step-by-step instructions to set up and run the DocAI application on a new machine.

## Overview

DocAI is a privacy-first, offline RAG (Retrieval-Augmented Generation) system that allows users to chat with their documents. The application consists of:

- **Backend**: FastAPI-based API server with AI agents for document processing
- **Frontend**: React-based web interface built with Vite and Tailwind CSS
- **Models**: Pre-trained embedding models for document analysis

## Prerequisites

Before setting up DocAI, ensure your system meets the following requirements:

### System Requirements
- **Operating System**: Windows, macOS, or Linux
- **Python**: Version 3.8 or higher
- **Node.js**: Version 16 or higher
- **Git**: For cloning the repository
- **Ollama**: For local LLM inference (optional, for enhanced features)

### Hardware Requirements
- **RAM**: At least 8GB recommended (16GB+ for better performance)
- **Storage**: At least 2GB free space for models and dependencies
- **GPU**: Optional, but recommended for faster processing (CUDA-compatible)

## Step 1: Clone the Repository

1. Open a terminal or command prompt
2. Navigate to your desired directory
3. Clone the repository:
   ```bash
   git clone https://github.com/Asmith-M/DocAI.git
   cd DocAI
   ```

## Step 2: Set Up the Backend

### 2.1 Create Virtual Environment
```bash
cd docai_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2.2 Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2.3 Set Up Environment Variables
Create a `.env` file in the `docai_backend` directory with the following content:

```env
HOST=127.0.0.1
PORT=8000
DEBUG=True
DATABASE_URL=sqlite:///./docai.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:5173
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=10485760
OPENAI_API_KEY=your-openai-api-key-here
```

**Note**: Replace `your-secret-key-here` with a secure random string and add your OpenAI API key if you plan to use OpenAI models.

### 2.4 Install Ollama (Optional)
If you want to use local LLM models:

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model:
   ```bash
   ollama pull llama2
   ```

### 2.5 Run the Backend
```bash
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`

## Step 3: Set Up the Frontend

### 3.1 Install Node.js Dependencies
```bash
cd ../docai-frontend
npm install
```

### 3.2 Start the Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Step 4: Verify Installation

### 4.1 Check Backend Health
Open your browser and navigate to:
```
http://localhost:8000/api/health
```

You should see a JSON response indicating the service is running.

### 4.2 Check Frontend
Open your browser and navigate to:
```
http://localhost:5173
```

You should see the DocAI interface.

## Step 5: Additional Configuration

### 5.1 Model Setup
The application includes pre-trained models in `docai_backend/models/`. These are automatically loaded on startup.

### 5.2 Database Initialization
The backend uses SQLite by default. The database file will be created automatically on first run.

### 5.3 File Uploads
- Ensure the `uploads` directory exists and has write permissions
- The maximum file size is configured in the `.env` file

## Step 6: Production Deployment

### 6.1 Backend Production Build
```bash
cd docai_backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 6.2 Frontend Production Build
```bash
cd docai-frontend
npm run build
npm run preview
```

### 6.3 Docker Deployment (Optional)
The project includes Docker configuration:

```bash
cd docai_backend
docker-compose -f docker-compose.offline.yml up
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change the port in `.env` file or use a different port
   - Kill processes using the port: `lsof -ti:8000 | xargs kill -9`

2. **Python Dependencies Issues**
   - Ensure you're in the virtual environment
   - Try: `pip install --upgrade pip`
   - Clear pip cache: `pip cache purge`

3. **Node.js Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

4. **Model Loading Issues**
   - Ensure sufficient RAM is available
   - Check model file integrity in `docai_backend/models/`

5. **Ollama Connection Issues**
   - Ensure Ollama is running: `ollama serve`
   - Check if the model is available: `ollama list`

### Logs
- Backend logs: Check the console where you started the backend
- Frontend logs: Check the browser console (F12) and terminal

## Support

If you encounter issues:

1. Check the logs for error messages
2. Verify all prerequisites are installed correctly
3. Ensure all environment variables are set properly
4. Try restarting both backend and frontend services

## Advanced Configuration

For advanced users, you can:

- Modify model configurations in `docai_backend/app/core/config.py`
- Customize the UI theme in `docai-frontend/tailwind.config.js`
- Add custom agents in `docai_backend/app/agents/`
- Configure additional storage backends

## Security Notes

- Change default passwords and API keys
- Use HTTPS in production
- Regularly update dependencies
- Monitor file upload sizes and types
- Consider using a reverse proxy for production deployments

---

**Congratulations!** You have successfully set up DocAI. You can now upload documents and start chatting with them using the web interface.
