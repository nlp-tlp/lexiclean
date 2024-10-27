import logging

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.config import config
from src.dependencies import get_db, get_user
from src.resources.schemas import Resource_Types, ResourceOut
from src.users.schemas import UserDocumentModel

logger = logging.getLogger(__name__)


router = APIRouter(prefix=f"{config.api.prefix}/resources", tags=["Resources"])


@router.get("")
async def get_resources_endpoint(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
    type: Resource_Types = Query(None),
):
    match_stage = {"created_by": user.id}
    if type:
        match_stage["type"] = type

    resources = await db.resources.find(match_stage).to_list(length=None)
    return [ResourceOut(**resource) for resource in resources]


@router.get("/{resource_id}")
async def get_resource(
    resource_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    logger.info(f"Getting resource with id: {resource_id}")

    resource = await db.resources.find_one(
        {"_id": ObjectId(resource_id), "created_by": user.id}
    )
    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with id '{resource_id}' not found",
        )
    return ResourceOut(**resource)


# @router.post("")
# async def create_scheme(body: SchemeCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
#     try:
#         scheme_model = SchemeDocumentModel(**body.dict())

#         inserted_scheme = await db.schemes.insert_one(
#             scheme_model.dict(exclude_none=True, by_alias=True)
#         )

#         new_scheme = await db.schemes.find_one({"_id": inserted_scheme.inserted_id})
#         return new_scheme
#     except DuplicateKeyError as e:
#         logger.info(f"DuplicateKeyError: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Scheme already exists",
#         )
