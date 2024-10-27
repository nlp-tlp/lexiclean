import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorClientSession

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient | None = None
session: AsyncIOMotorClientSession | None = None


def get_client() -> AsyncIOMotorClient | None:
    return client


def connect_to_mongo(uri: str) -> None:
    global client
    if client is None:
        client = AsyncIOMotorClient(uri)
        logger.info("Connected to MongoDB.")


def close_mongo_connection() -> None:
    global client
    if client:
        client.close()
        client = None  # ignore: type[assignment]
