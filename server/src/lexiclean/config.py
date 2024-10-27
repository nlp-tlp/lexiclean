from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
from lexiclean.constants import ENGLISH_LEXICON


class MongoDBSettings(BaseSettings):
    uri: SecretStr = (
        "mongodb+srv://dev:LOdiK66nhq17Cvwh@lexiclean.4pchxoj.mongodb.net/lexiclean?retryWrites=true&w=majority"
    )
    db_name: str = "dev"


class AuthSettings(BaseSettings):
    secret_key: SecretStr = "your-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30


class ApiSettings(BaseSettings):
    prefix: str = "/api"


class Config(BaseSettings):
    @property
    def english_lexicon(self):
        return ENGLISH_LEXICON

    auth: AuthSettings = AuthSettings()
    mongodb: MongoDBSettings = MongoDBSettings()
    api: ApiSettings = ApiSettings()

    model_config = SettingsConfigDict(
        env_file=".env", env_nested_delimiter="__", env_file_encoding="utf-8"
    )


@lru_cache()
def get_config():
    return Config()


config = get_config()
