"""Users schemas."""

from datetime import datetime
from typing import Optional, Union

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, SecretStr

from lexiclean.models import AnnotatedObjectId


class BaseDocument(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(arbitrary_types_allowed=True)


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
    openai_api_key: Optional[str] = None
    name: Optional[str] = None
    security_question: Optional[str] = None
    security_answer: Optional[str] = None
    email: Optional[Union[EmailStr, str]] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str):
        if v is not None and v != "":
            # If it's not None or empty string, it must be a valid email
            try:
                EmailStr.validate(v)
            except ValueError:
                raise ValueError("Invalid email address")
        return v if v else None  # Convert empty string to None

    @field_validator("name")
    def validate_name(cls, v: str):
        if v is not None:
            if not v:  # Check if empty string
                raise ValueError("Name cannot be empty")
            if len(v) < 1:
                raise ValueError("Name must be at least 1 character long")
        return v

    @field_validator("security_question")
    @classmethod
    def validate_security_question(cls, v: str):
        if v is not None:
            if not v:  # Check if empty string
                raise ValueError("Security question cannot be empty")
            if len(v) < 10:
                raise ValueError(
                    "Security question must be at least 10 characters long"
                )
        return v

    @field_validator("security_answer")
    @classmethod
    def validate_security_answer(cls, v: str):
        if v is not None:
            if not v:  # Check if empty string
                raise ValueError("Security answer cannot be empty")
            if len(v) < 1:
                raise ValueError("Security answer must be at least 1 character long")
        return v

    @field_validator("openai_api_key")
    @classmethod
    def validate_openai_api_key(cls, v: str):
        if v is not None and v != "":  # Allow empty string to clear the key
            if not v.startswith("sk-") or len(v) != 51:
                raise ValueError("Invalid OpenAI API key format")
        return v


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
