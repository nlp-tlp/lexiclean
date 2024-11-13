"""Configuration settings."""

from functools import lru_cache
from typing import List

from pydantic import BaseModel, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

from lexiclean.constants import ENGLISH_LEXICON

BASE_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000",
    "http://localhost:8000",
    "http://fastapi:8000",
    "http://0.0.0.0:3000",
    "http://0.0.0.0:8000",
]


class SettingsMongoDB(BaseModel):
    uri: SecretStr
    db_name: str

    @property
    def mongodb_uri(self) -> str:
        return self.uri.get_secret_value()


class SettingsAuth(BaseModel):
    secret_key: SecretStr
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 360

    @property
    def secret_key_value(self) -> str:
        return self.secret_key.get_secret_value()


class SettingsAPI(BaseModel):
    prefix: str = "/api"
    docs_url: str | None = "/docs"
    redoc_url: str | None = "/redoc"
    openapi_url: str | None = "/openapi.json"
    debug_endpoints: bool = True
    extra_origins: List[str] = []

    @property
    def allowed_origins(self) -> List[str]:
        return BASE_ALLOWED_ORIGINS + self.extra_origins


class Config(BaseSettings):
    api: SettingsAPI = SettingsAPI()
    auth: SettingsAuth
    mongodb: SettingsMongoDB
    environment: str = "development"

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def english_lexicon(self):
        return ENGLISH_LEXICON

    model_config = SettingsConfigDict(
        env_file=".env",
        env_nested_delimiter="__",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_config() -> Config:
    """Get configuration."""
    return Config()  # type: ignore


config = get_config()
