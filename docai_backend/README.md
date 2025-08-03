# DocAI Backend

This is the backend API for the DocAI application, built with FastAPI.

## Project Structure

```
docai_backend/
├── app/
│   ├── api/          # API routes
│   ├── core/         # Core configuration
│   ├── models/       # Data models
│   ├── services/     # Business logic
│   └── utils/        # Utility functions
├── main.py           # Application entry point
├── requirements.txt  # Python dependencies
├── .env              # Environment variables
└── .gitignore        # Git ignore file
```

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

- Health check: `GET /api/health`
- Upload document: `POST /api/upload/`
- Upload status: `GET /api/upload/status`

## Environment Variables

Create a `.env` file with the following variables:

```
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

## Development

To run the development server with auto-reload:

```bash
uvicorn main:app --reload
```

For production, run without the `--reload` flag:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
