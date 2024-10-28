# LexiClean Server

FastAPI backend server for the LexiClean annotation tool, providing APIs for multi-task lexical normalization.

## 🚀 Quick Start

1. **Set Up Environment**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate   # On Windows, use: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB__URI="<YOUR_MONGODB_URI>"
   MONGODB__DB_NAME="<YOUR_MONGODB_DB_NAME>"

   # Authentication Settings
   AUTH__SECRET_KEY="your-secret-key"
   AUTH__ALGORITHM="HS256"
   AUTH__ACCESS_TOKEN_EXPIRE_MINUTES=360

   # API Configuration
   API__PREFIX="/api"
   ```

3. **Start Server**
   ```bash
   uvicorn src.lexiclean.main:app --reload
   ```
   Server will be available at `http://localhost:8000`


## 📚 API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🛠️ Development

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install

# Format code
black .
isort .
```

## 🔐 Security

- JWT-based authentication
- Secure password hashing
- Role-based access control

## 📋 Requirements

- Python 3.8+
- MongoDB 4.4+
- pip
