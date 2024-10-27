"""Annotation schemas."""

from typing import Literal, Optional, Union

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from lexiclean.models import AnnotatedObjectId, BaseDocument

Annotation_Types = Literal["tag", "replacement", "save", "flag"]


class AnnotationDocumentModel(BaseDocument):
    type: Annotation_Types = Field(..., description="The type of annotation")
    suggestion: bool = Field(..., description="Whether the annotation is a suggestion")
    value: Union[bool, str, ObjectId] = Field(
        ..., description="The value of the annotation"
    )
    text_id: ObjectId = Field(..., description="The associated text id")
    token_id: Optional[ObjectId] = Field(..., description="The associated token id")
    project_id: ObjectId = Field(..., description="The associated project id")


class TagOut(BaseModel):
    id: AnnotatedObjectId = Field(alias="_id")
    suggestion: bool
    value: AnnotatedObjectId

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
