"""Notification schemas."""

from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from lexiclean.models import AfterAnnotatedObjectId, AnnotatedObjectId, BaseDocument

NOTIFICATION_TYPE = Literal["project_invite"]
NOTIFICATION_STATUS = Literal["accepted", "rejected", "pending"]
INVITE_NOTIFICATION_STATUS = Literal["accept", "reject"]


class NotificationDocumentModel(BaseDocument):
    sender_id: ObjectId
    receiver_id: ObjectId
    project_id: ObjectId
    type: NOTIFICATION_TYPE
    status: NOTIFICATION_STATUS = Field(default="pending")
    read: bool = Field(default=False)

    model_config = ConfigDict(arbitrary_types_allowed=True)


class NotificationCreate(BaseModel):
    sender_id: AfterAnnotatedObjectId
    receiver_id: AfterAnnotatedObjectId
    project_id: AfterAnnotatedObjectId
    type: NOTIFICATION_TYPE
    status: NOTIFICATION_STATUS
    read: bool = Field(default=False)

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class NotificationUpdate(BaseModel):
    status: NOTIFICATION_STATUS


class ProjectOut(BaseModel):
    id: AnnotatedObjectId = Field(alias="_id")
    name: str

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class SenderOut(BaseModel):
    username: str


class NotificationOut(BaseDocument):
    id: AnnotatedObjectId = Field(alias="_id")
    sender: SenderOut
    project: ProjectOut
    type: NOTIFICATION_TYPE
    status: NOTIFICATION_STATUS
    read: bool
    created_by: AnnotatedObjectId

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
