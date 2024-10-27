import logging
from datetime import datetime
from typing import Annotated, Literal, Optional, List, Dict, Union

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.functional_validators import AfterValidator, BeforeValidator
from typing_extensions import Self
from lexiclean.models import AnnotatedObjectId

logger = logging.getLogger(__name__)

Resource_Types = Literal["tag", "map", "flag"]


class BaseDocument(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: ObjectId = Field(...)

    model_config = ConfigDict(arbitrary_types_allowed=True)


class ResourceDocumentModel(BaseDocument):
    name: str = Field(..., description="Name of the resource")
    description: str = Field(default="", description="Description of the resource")
    type: Resource_Types = Field(..., description="Type of resource")
    values: Union[List[str], Dict[str, str]] = Field(
        ...,
        description="Value of the resource",
        examples=[["hello", "world"], {"h3llo": "hello"}],
    )
    color: Optional[str] = Field(
        default="#ff0000",
        min_length=3,
        max_length=7,
        pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
        description="Hex color code",
        examples=["#ff0000"],
    )
    active: bool = Field(default=True)
    project_id: ObjectId = Field(...)


class ResourceCreate(BaseModel):
    type: Resource_Types = Field(..., description="Type of resource")

    values: Union[List[str],Dict[str, str]] = Field(
        ...,
        description="Value of the resource",
        examples=[["hello", "world"], {"h3llo": "hello"}],
    )


class ResourceOut(BaseModel):
    id: AnnotatedObjectId = Field(alias="_id")
    name: str
    description: str = Field(default="")
    type: Resource_Types
    values: Union[List[str], Dict[str, str]]
    color: Optional[str]
    active: bool
    project_id: AnnotatedObjectId = Field(alias="project_id")

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


# class SchemeOut(BaseModel):
#     id: AnnotatedObjectId = Field(alias="_id")
#     username: str
#     password: str

#     model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
