from functools import lru_cache
from typing import Optional

from pydantic import BaseModel, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

from lexiclean.constants import ENGLISH_LEXICON


class SettingsMongoDB(BaseModel):
    uri: Optional[SecretStr] = Field(default=None, validation_alias="MONGODB__URI")
    db_name: Optional[str] = Field(default=None, validation_alias="MONGODB__DB_NAME")

    @property
    def mongodb_uri(self) -> Optional[str]:
        if self.uri:
            return self.uri.get_secret_value()
        return None


class SettingsAuth(BaseModel):
    secret_key: Optional[SecretStr] = Field(
        default=None, validation_alias="AUTH__SECRET_KEY"
    )
    algorithm: str = Field(default="HS256", validation_alias="AUTH__ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=30, validation_alias="AUTH__ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    @property
    def secret_key_value(self) -> Optional[str]:
        if self.secret_key:
            return self.secret_key.get_secret_value()
        return None


class SettingsAPI(BaseModel):
    prefix: str = Field(default="/api", validation_alias="API__PREFIX")


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
