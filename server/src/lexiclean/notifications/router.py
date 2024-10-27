"""Notifications router."""

import logging

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.config import config
from src.dependencies import get_db, get_user
from src.notifications.schemas import (
    INVITE_NOTIFICATION_STATUS,
    NotificationDocumentModel,
    NotificationOut,
    ProjectOut,
    SenderOut,
)
from src.users.schemas import UserDocumentModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{config.api.prefix}/notifications", tags=["Notifications"])


@router.get("")
async def get_notifications_endpoint(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0),
):
    """
    Get all notifications for a user.
    """

    pipeline = [
        {"$match": {"receiver_id": user.id}},
        {
            "$lookup": {
                "from": "users",
                "localField": "sender_id",
                "foreignField": "_id",
                "as": "sender",
            }
        },
        {"$unwind": "$sender"},
        {
            "$lookup": {
                "from": "projects",
                "localField": "project_id",
                "foreignField": "_id",
                "as": "project",
            }
        },
        {"$unwind": "$project"},
        {
            "$project": {
                "sender_id": 0,
                "project_id": 0,
            }
        },
        {
            "$sort": {"created_at": -1},
        },
        {"$skip": skip},
        {"$limit": limit},
    ]

    notifications = await db.notifications.aggregate(pipeline).to_list(None)

    logger.info(f"notifications found: {len(notifications)}")

    output = []
    for notification in notifications:
        sender = notification.pop("sender")
        project = notification.pop("project")

        output.append(
            NotificationOut(
                **notification,
                sender=SenderOut(id=sender["_id"], username=sender["username"]),
                project=ProjectOut(id=project["_id"], name=project["name"]),
            )
        )

    return output
    # return [NotificationOut(**n) for n in notifications]


@router.patch("/{notification_id}")
async def update_notification_endpoint(
    notification_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
    read: bool = Query(None, description="Read status"),
):
    """
    Update a notification read state.
    """
    try:
        notification_id = ObjectId(notification_id)
    except InvalidId:
        logger.info(f"Invalid notification ID: {notification_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification ID"
        )

    notification = await db.notifications.find_one(
        {"_id": notification_id, "receiver_id": user.id}
    )
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )

    # If the state is updated, the user has acknowledged the notification and it is `read`.
    await db.notifications.update_one(
        {"_id": notification_id}, {"$set": {"read": read}}
    )

    return {"message": "Notification updated successfully."}


@router.patch("/invite/{notification_id}")
async def update_invite_notification_endpoint(
    notification_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
    _status: INVITE_NOTIFICATION_STATUS = Query(
        ..., description="Invite status", alias="status"
    ),
):
    """Update a project invite notification status."""

    try:
        notification_id = ObjectId(notification_id)
    except InvalidId:
        logger.info(f"Invalid notification ID: {notification_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification ID"
        )

    notification = await db.notifications.find_one(
        {"_id": notification_id, "receiver_id": user.id, "type": "project_invite"}
    )
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )

    project = await db.projects.find_one(
        {"_id": ObjectId(notification["project_id"])}, {"annotators": 1}
    )
    annotators = project["annotators"]

    # Update the status of the user in the project's annotators list
    updated = False
    for annotator in annotators:
        if annotator["_id"] == user.id:
            annotator["status"] = f"{_status}ed"
            updated = True
            break

    if updated:
        await db.projects.find_one_and_update(
            {"_id": ObjectId(notification["project_id"])},
            {"$set": {"annotators": annotators}},
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not invited to this project",
        )

    # If the state is updated, the user has acknowledged the notification and it is `read`.
    await db.notifications.update_one(
        {"_id": notification_id}, {"$set": {"status": f"{_status}ed", "read": True}}
    )

    return {"message": "Notification updated successfully."}


@router.patch("/uninvite")
async def delete_project_invite_notification_endpoint(
    usernames: list[str] = Body(..., min_items=1),
    project_id: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """
    Delete project invite notifications.
    """
    try:
        project_id = ObjectId(project_id)
    except InvalidId:
        logger.info(f"Invalid project ID: {project_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project ID"
        )

    # Check if project exists
    project = await db.projects.find_one({"_id": project_id})
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check if usernames are valid
    users = await db.users.find(
        {"username": {"$in": usernames}},
        {"_id": 1, "username": 1},
    ).to_list(None)

    users_not_found = set(usernames) - {u["username"] for u in users}

    if users_not_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Users not found: {', '.join(users_not_found)}",
        )

    receiver_ids = [u["_id"] for u in users]

    for receiver_id in receiver_ids:
        # Check if notification already exists
        notification = await db.notifications.find_one(
            {
                "receiver_id": receiver_id,
                "project_id": project_id,
                "type": "project_invite",
            }
        )

        if notification is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
            )

        await db.notifications.delete_one({"_id": notification["_id"]})

    return {"message": "Notification(s) deleted successfully."}


@router.post("/invite")
async def create_project_invite_notification_endpoint(
    usernames: list[str] = Body(..., min_items=1),
    project_id: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """
    Create a project invite notification.
    """
    try:
        project_id = ObjectId(project_id)
    except InvalidId:
        logger.info(f"Invalid project ID: {project_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project ID"
        )

    # Check if project exists
    project = await db.projects.find_one({"_id": project_id})
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check if usernames are valid
    users = await db.users.find(
        {"username": {"$in": usernames}},
        {"_id": 1, "username": 1},
    ).to_list(None)

    users_not_found = set(usernames) - {u["username"] for u in users}

    if users_not_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Users not found: {', '.join(users_not_found)}",
        )

    if user.username in usernames:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot invite yourself"
        )

    receiver_ids = [u["_id"] for u in users]

    for receiver_id in receiver_ids:
        # Check if notification already exists
        notification = await db.notifications.find_one(
            {
                "receiver_id": receiver_id,
                "project_id": project_id,
                "type": "project_invite",
            }
        )

        if notification is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Notification already exists",
            )

        notification = {
            "sender_id": user.id,
            "receiver_id": receiver_id,
            "project_id": project_id,
            "type": "project_invite",
            "created_by": user.id,
        }
        notification = NotificationDocumentModel(**notification).model_dump(
            by_alias=True, exclude_none=True
        )

        await db.notifications.insert_one(notification)

    # Add users to the project `annotators` field
    await db.projects.update_one(
        {"_id": project_id},
        {
            "$addToSet": {
                "annotators": {
                    "$each": [
                        {"_id": ObjectId(r), "status": "pending"} for r in receiver_ids
                    ]
                }
            }
        },
    )

    return {"message": "Notification(s) created successfully."}
