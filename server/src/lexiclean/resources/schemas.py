"""Resources schemas."""

import logging
from typing import Dict, List, Literal, Optional, Union

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from lexiclean.models import AnnotatedObjectId, BaseDocument

logger = logging.getLogger(__name__)

Resource_Types = Literal["tag", "map", "flag"]


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

    values: Union[List[str], Dict[str, str]] = Field(
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
