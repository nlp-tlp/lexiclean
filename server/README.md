# LexiClean server

To run the LexiClean server, first start the venv and install the dependencies, then run the uvicorn server
```bash
uvicorn src.lexiclean.main:app
```

This will load the server on `localhost:8000`