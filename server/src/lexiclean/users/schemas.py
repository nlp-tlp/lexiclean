"""Users schemas."""

from datetime import datetime
from typing import Annotated

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, SecretStr, EmailStr
from pydantic.functional_validators import BeforeValidator

AnnotatedObjectId = Annotated[ObjectId | str, BeforeValidator(lambda x: str(x))]


class BaseDocument(BaseModel):
    id: ObjectId | None = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    model_config = ConfigDict(arbitrary_types_allowed=True)


class UserDocumentModel(BaseDocument):
    username: str = Field(...)
    hashed_password: str = Field(...)
    email: EmailStr | None = Field(default=None)
    name: str | None = Field(deafult=None)
    openai_api_key: str = Field(default="")
    api_key: ObjectId
    security_question: str = Field(...)
    hashed_security_answer: str = Field(...)


class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr | None = Field(default=None)
    name: str | None = Field(default=None)
    security_question: str
    security_answer: str


class UserUpdate(BaseModel):
    openai_api_key: str | None = Field(default=None, min_length=0)
    name: str | None = Field(default=None, min_length=1)
    security_question: str | None = Field(default=None, min_length=10)
    security_answer: str | None = Field(default=None, min_length=1)
    email: EmailStr | None = Field(default=None)


class UserOut(BaseModel):
    id: AnnotatedObjectId = Field(alias="_id")
    username: str
    email: EmailStr | None
    name: str | None
    openai_api_key: SecretStr
    api_key: AnnotatedObjectId | None  # TODO: Make SecretStr
    created_at: datetime
    updated_at: datetime
    security_question: str
    model_config = ConfigDict(
        populate_by_name=True, arbitrary_types_allowed=True, from_attributes=True
    )


class SecurityQuestionReset(BaseModel):
    username: str
    security_question: str
    security_answer: str
    new_password: str
