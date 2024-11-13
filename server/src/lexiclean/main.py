import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase

from lexiclean.config import config, get_config
from lexiclean.database import close_mongo_connection, connect_to_mongo
from lexiclean.dependencies import get_db, get_user
from lexiclean.notifications.router import router as notifications_router
from lexiclean.projects.router import router as projects_router
from lexiclean.resources.router import router as resurces_router
from lexiclean.texts.router import router as texts_router
from lexiclean.tokens.router import router as tokens_router
from lexiclean.users.router import router as users_router
from lexiclean.users.schemas import UserDocumentModel, UserOut

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


description = """
    🧽 LexiClean API powers the LexiClean application.
"""

tags_metadata = [
    {
        "name": "users",
        "description": "Operations with users. The **login** and **signup** logic is also here.",
    },
]

mongodb_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore
    config = get_config()

    logger.info(f"Connecting to database with URI: {config.mongodb.mongodb_uri}")
    connect_to_mongo(uri=config.mongodb.mongodb_uri)
    try:
        yield
    finally:
        # Cleanup: close database connection
        close_mongo_connection()
        logger.info("Database connection closed")


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000",
    "http://localhost:8000",
    "http://fastapi:8000",
    "http://0.0.0.0:3000",
    "http://0.0.0.0:8000",
]

app = FastAPI(
    title="LexiClean",
    description=description,
    version="0.0.1",
    contact={"name": "Tyler Bikaun", "email": "tylerbikaun@gmail.com"},
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(projects_router)
app.include_router(texts_router)
app.include_router(resurces_router)
app.include_router(tokens_router)
app.include_router(notifications_router)
# app.include_router(maps.router)


@app.get(f"{config.api.prefix}/settings")
def read_settings():
    return config


@app.get(f"{config.api.prefix}/db")
async def read_db(db: AsyncIOMotorDatabase = Depends(get_db)):
    if db.client:
        collection_names = await db.list_collection_names()
        return {"message": "Database connected", "collection_names": collection_names}
    else:
        return {"message": "Database not connected"}


@app.get(f"{config.api.prefix}/protected")
async def protected_route(user: UserDocumentModel = Depends(get_user)):
    return {
        "message": "You are authenticated",
        "user": UserOut(**user.model_dump()),
    }


@app.get(f"{config.api.prefix}/health")
async def health_check(db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        # Check database connection
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy",
        )
