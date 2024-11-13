"""Configuration settings."""

from functools import lru_cache

from pydantic import BaseModel, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

from lexiclean.constants import ENGLISH_LEXICON

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


class Config(BaseSettings):
    api: SettingsAPI = SettingsAPI()
    auth: SettingsAuth
    mongodb: SettingsMongoDB

    @property
    def english_lexicon(self):
        return ENGLISH_LEXICON
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_nested_delimiter="__",
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_config() -> Config:
    """Get configuration."""
    return Config()

config = get_config()