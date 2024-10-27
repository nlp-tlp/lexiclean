import logging
from functools import lru_cache
from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
from lexiclean.config import Config
from lexiclean.database import get_client
from lexiclean.users.schemas import UserDocumentModel

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@lru_cache()
def get_config():
    return Config()


class UnauthorizedException(HTTPException):
    def __init__(self, detail: str, **kwargs):
        """Returns HTTP 403"""
        super().__init__(status.HTTP_403_FORBIDDEN, detail=detail)


class UnauthenticatedException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Requires authentication"
        )


async def get_db(
    config: Config = Depends(get_config),
) -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    """Yield a MongoDB database instance."""
    client = get_client()
    if client is None:
        logger.info("Failed to connect to MongoDB client.")
        raise ConnectionError("Failed to retrieve MongoDB client.")

    db = client[config.mongodb.db_name]
    # logger.info(f"Connected to database: {db.name}")
    try:
        yield db
    finally:
        if db is not None:
            # logger.info(f"Releasing connection to database: {db.name}")
            pass


async def get_user(
    token: dict = Depends(oauth2_scheme),
    config: Config = Depends(get_config),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    logger.info(f"Authenticating user with token: {token}")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            config.auth.secret_key.get_secret_value(),
            algorithms=[config.auth.algorithm],
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception

    return UserDocumentModel(**user)


# api_key_header = APIKeyHeader(name="x-api-key", auto_error=True)

# async def get_user(
#     api_key: str = Depends(api_key_header), db: AsyncIOMotorDatabase = Depends(get_db)
# ):
#     logger.info(api_key)

#     user = await db.users.find_one({"api_key": ObjectId(api_key)})

#     if user is None:
#         raise HTTPException(status_code=404, detail="User not found")

#     return UserDocumentModel(**user)


# async def get_project_user(user_id: str, db: AsyncIOMotorDatabase):
#     pass
