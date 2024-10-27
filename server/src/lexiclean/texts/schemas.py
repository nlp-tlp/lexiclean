from datetime import datetime
from typing import Annotated, Any, Literal, Optional, List, Dict

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.functional_validators import AfterValidator, BeforeValidator
from lexiclean.annotations.schemas import TagOut

from lexiclean.models import AnnotatedObjectId

Resource_Types = Literal["tag", "map"]


class BaseDocument(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: ObjectId = Field(...)

    model_config = ConfigDict(arbitrary_types_allowed=True)


class Token(BaseModel):
    id: ObjectId = Field(
        default_factory=ObjectId, alias="_id", description="The token id"
    )
    index: int = Field(
        ..., description="The index of the token", examples=[0, 1, 2], ge=0
    )
    value: str = Field(
        ..., description="The value of the token", examples=["hello", "world"]
    )
    in_vocab: bool = Field(
        ..., description="Whether the token is in the English vocabulary"
    )

    model_config = ConfigDict(arbitrary_types_allowed=True)


class TextDocumentModel(BaseDocument):
    original: str = Field(
        ..., description="The original text", examples=["H3llo, World!"]
    )
    weight: float = Field(
        default=0, description="The weight of the text", examples=[0, 0.5, 1.0], ge=0
    )
    rank: int = Field(
        default=0, description="The rank of the text", examples=[0, 1, 2], ge=0
    )
    identifiers: List[str] = Field(
        default=[],
        description="The list of identifiers",
        examples=[["id1", "id2", "id3"]],
    )
    project_id: ObjectId = Field(..., description="The associated projects id")
    tokens: List[Token] = Field(
        ...,
        description="The list of tokens",
        min_items=1,
    )

    model_config = ConfigDict(arbitrary_types_allowed=True)


class TokenOut(BaseModel):
    id: AnnotatedObjectId = Field(alias="_id")
    index: int
    value: str
    current_value: str
    in_vocab: bool
    suggestion: Optional[str] = Field(default=None)
    replacement: Optional[str] = Field(default=None)
    # tags: List[TagOut] = Field(default=[])
    tags: List[AnnotatedObjectId] = Field(default=[])

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class TextOut(BaseModel):
    id: AnnotatedObjectId = Field(alias="_id")
    original: str
    weight: float
    rank: int
    identifiers: List[str]
    project_id: AnnotatedObjectId
    tokens: List[TokenOut]
    flags: List[AnnotatedObjectId] = Field(default=[])
    saved: bool

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
