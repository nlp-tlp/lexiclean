from functools import lru_cache
from typing import Optional

from pydantic import BaseModel, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

from lexiclean.constants import ENGLISH_LEXICON


class SettingsMongoDB(BaseModel):
    uri: SecretStr = Field(...)
    db_name: str = Field(...)

    @property
    def mongodb_uri(self) -> str:
        return self.uri.get_secret_value()


class SettingsAuth(BaseModel):
    secret_key: SecretStr = Field(...)
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=360)

    @property
    def secret_key_value(self) -> str:
        return self.secret_key.get_secret_value()


class SettingsAPI(BaseModel):
    prefix: str = Field(default="/api")


class Config(BaseSettings):
    @property
    def english_lexicon(self):
        return ENGLISH_LEXICON

    auth: SettingsAuth
    mongodb: SettingsMongoDB
    api: SettingsAPI

    model_config = SettingsConfigDict(
        env_file=".env", env_nested_delimiter="__", env_file_encoding="utf-8"
    )


@lru_cache()
def get_config():
    return Config()


config = get_config()
