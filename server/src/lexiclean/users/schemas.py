"""Users schemas."""

from datetime import datetime
from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field, SecretStr

from lexiclean.models import AnnotatedObjectId, BaseDocument


class UserDocumentModel(BaseDocument):
    username: str = Field(...)
    hashed_password: str = Field(...)
    email: Optional[EmailStr] = Field(default=None)
    name: Optional[str] = Field(deafult=None)
    openai_api_key: str = Field(default="")
    api_key: ObjectId
    security_question: str = Field(...)
    hashed_security_answer: str = Field(...)


class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = Field(default=None)
    name: Optional[str] = Field(default=None)
    security_question: str
    security_answer: str


class UserUpdate(BaseModel):
    openai_api_key: Optional[str] = Field(default=None, min_length=0)
    name: Optional[str] = Field(default=None, min_length=1)
    security_question: Optional[str] = Field(default=None, min_length=10)
    security_answer: Optional[str] = Field(default=None, min_length=1)
    email: Optional[EmailStr] = Field(default=None)


class UserOut(BaseModel):
    id: AnnotatedObjectId = Field(alias="_id")
    username: str
    email: Optional[EmailStr]
    name: Optional[str]
    openai_api_key: SecretStr
    api_key: Optional[AnnotatedObjectId]  # TODO: Make SecretStr
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
