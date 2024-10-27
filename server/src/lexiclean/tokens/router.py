import logging
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field
from pymongo import InsertOne
from src.annotations.schemas import AnnotationDocumentModel
from src.config import config
from src.dependencies import get_db, get_user
from src.users.schemas import UserDocumentModel
from src.utils import text_token_search_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{config.api.prefix}/tokens", tags=["Tokens"])


class BaseReplacementBody(BaseModel):
    project_id: str
    token_id: str
    text_id: str
    value: str = Field(
        ...,
        description="The value to search for, e.g. the original value of the token.",
    )
    apply_all: bool


class AddReplacementBody(BaseReplacementBody):
    replacement: str = Field(..., description="The replacement value")


class DeleteRelacementBody(BaseReplacementBody):
    pass


class AcceptReplacementBody(BaseReplacementBody):
    pass


class BaseTagBody(BaseModel):
    tag_id: str
    project_id: str
    text_id: str
    token_id: str
    apply_all: bool


class AddTagBody(BaseTagBody):
    pass


class RemoveTagBody(BaseTagBody):
    pass


@router.patch("/add/replacement")
async def add_token_replacement_endpoint(
    body: AddReplacementBody,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Add replacement to a token.

    Route for adding token-level replacmement, e.g. "co" -> "change out".
    Optionality for cascading change across the corpora for matching tokens.
    TODO: Ensure that when `applyAll` is used, saved texts are not impacted. Filter these out.
    """

    project_id = ObjectId(body.project_id)
    text_id = ObjectId(body.text_id)
    token_id = ObjectId(body.token_id)
    user_id = ObjectId(user.id)
    replacement = body.replacement
    value = body.value

    annotations = 0
    text_token_ids = {}

    # Check if annotation already exists for this token
    annotation = await db.annotations.find_one(
        {
            "token_id": token_id,
            "created_by": user_id,
            "type": "replacement",
            "value": replacement,
        }
    )

    if annotation:
        if annotation["suggestion"]:
            # Update existing annotation (convert to suggestion into accepted replacement)
            await db.annotations.update_one(
                {"_id": annotation["_id"]},
                {"$set": {"suggestion": False}},
            )
            text_token_ids = {str(annotation["text_id"]): [str(token_id)]}
            annotations += 1
        elif not body.apply_all:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Replacement already exists for this token.",
            )
    else:
        # Create new annotation
        annotation = AnnotationDocumentModel(
            project_id=project_id,
            text_id=text_id,
            token_id=token_id,
            created_by=user_id,
            type="replacement",
            suggestion=False,
            value=replacement,
        )
        await db.annotations.insert_one(annotation.model_dump(exclude_none=True))
        text_token_ids = {str(text_id): [str(token_id)]}
        annotations += 1

    if body.apply_all:
        logger.info("applying replacement to all matching tokens")

        # Find matching tokens in the project
        result = await db.texts.aggregate(
            text_token_search_pipeline(
                project_id=project_id,
                search_value=value,
                exclude_token_ids=[ObjectId(token_id)],
            )
        ).to_list(None)

        if result is None or len(result) == 0:
            return {"count": 0, "text_token_ids": {}}

        candidate_tokens = result
        logger.info(f"found {len(candidate_tokens)} candidate tokens")
        logger.info(f"candidate_tokens: {candidate_tokens}")

        candidate_token_ids = {str(token["token_id"]) for token in candidate_tokens}

        # Check whether candidate tokens are already annotated with replacements
        annotated_tokens = await db.annotations.find(
            {
                "created_by": user_id,
                "type": "replacement",
                "token_id": {"$in": [ObjectId(_id) for _id in candidate_token_ids]},
            }
        ).to_list(length=None)

        logger.info(f"Annotated tokens: {annotated_tokens}")

        annotated_token_ids = {str(token["token_id"]) for token in annotated_tokens}

        # Get the tokens that are eligible for annotation
        update_token_ids = candidate_token_ids - annotated_token_ids
        logger.info(f"Update token ids: {update_token_ids}")

        # Create the update operations
        update_operations = []
        for token in candidate_tokens:
            token_id = token["token_id"]
            logger.info(f"Token: {token}")
            if str(token_id) in update_token_ids:
                print("adding annotation")
                text_id = token["text_id"]
                token_id = token["token_id"]
                annotation = AnnotationDocumentModel(
                    project_id=project_id,
                    text_id=ObjectId(text_id),
                    token_id=ObjectId(token_id),
                    created_by=user_id,
                    type="replacement",
                    suggestion=True,
                    value=replacement,
                )
                update_operations.append(
                    InsertOne(annotation.model_dump(exclude_none=True))
                )

                if str(text_id) in text_token_ids:
                    text_token_ids[str(text_id)].append(str(token_id))
                else:
                    text_token_ids[str(text_id)] = [str(token_id)]

        if len(update_operations) > 0:
            logger.info(f"Adding {len(update_operations)} annotations")
            await db.annotations.bulk_write(update_operations)
            annotations += len(update_operations)

        return {"count": annotations, "text_token_ids": text_token_ids}
    return {"count": annotations, "text_token_ids": text_token_ids}


@router.patch("/remove/replacement")
async def remove_token_replacement_endpoint(
    body: DeleteRelacementBody,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Remove replacement from a token.

    If the user uses `apply_all` and the replacement is a suggestion, delete all suggestions. If the user deletes a replacement, delete all replacments and suggestions. Do not include items that are saved.
    """

    project_id = ObjectId(body.project_id)
    token_id = ObjectId(body.token_id)
    user_id = ObjectId(user.id)
    value = body.value
    apply_all = body.apply_all

    # Check if annotation already exists for this token
    annotation = await db.annotations.find_one(
        {"token_id": token_id, "created_by": user_id, "type": "replacement"}
    )
    logger.info(f"Annotation: {annotation}")

    if annotation is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No replacement exists for this token.",
        )

    is_suggestion = annotation["suggestion"]
    text_token_ids = {}

    if apply_all:
        # Find matching tokens in the project
        result = await db.texts.aggregate(
            text_token_search_pipeline(
                project_id=project_id,
                search_value=value,
            )
        ).to_list(None)

        if result is None or len(result) == 0:
            return {"count": 0, "text_token_ids": {}}

        candidate_tokens = result
        logger.info(f"found {len(candidate_tokens)} candidate tokens")

        query = {
            "created_by": user_id,
            "type": "replacement",
            "value": annotation["value"],
            "token_id": {
                "$in": [ObjectId(token["token_id"]) for token in candidate_tokens]
            },
            "suggestion": True if is_suggestion else {"$exists": True},
        }
        logger.info(f"Query: {query}")

        annotations = await db.annotations.find(query).to_list(length=None)
        logger.info(f"Annotations to delete: {len(annotations)}")

        await db.annotations.delete_many(
            {"_id": {"$in": [ObjectId(a["_id"]) for a in annotations]}}
        )

        for anno in annotations:
            text_id = anno["text_id"]
            token_id = anno["token_id"]
            if str(text_id) in text_token_ids:
                text_token_ids[str(text_id)].append(str(token_id))
            else:
                text_token_ids[str(text_id)] = [str(token_id)]
        return {"count": len(annotations), "text_token_ids": text_token_ids}
    else:
        await db.annotations.delete_one({"_id": annotation["_id"]})
        return {
            "count": 1,
            "text_token_ids": {str(annotation["text_id"]): [str(token_id)]},
        }


@router.patch("/accept/replacement")
async def accept_token_replacement_endpoint(
    body: AcceptReplacementBody,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Accept replacement for a token.

    If the user uses `apply_all`, accept all suggestions on matched tokens.
    """

    project_id = ObjectId(body.project_id)
    text_id = ObjectId(body.text_id)
    token_id = ObjectId(body.token_id)
    user_id = ObjectId(user.id)
    apply_all = body.apply_all
    value = body.value
    logger.info(f"user_id: {user_id}")

    # # Check if annotation already exists for this token
    # annotation = await db.annotations.find_one(
    #     {"token_id": token_id, "created_by": user_id, "type": "replacement"}
    # )

    # print(annotation)
    text_token_ids = {}
    if apply_all:
        # Find matching tokens in the project
        result = await db.texts.aggregate(
            text_token_search_pipeline(
                project_id=project_id,
                search_value=value,
            )
        ).to_list(None)
        if result is None or len(result) == 0:
            return {"count": 0, "text_token_ids": {}}

        candidate_tokens = result
        logger.info(f"found {len(candidate_tokens)} candidate tokens")
        candidate_token_ids = [
            ObjectId(token["token_id"]) for token in candidate_tokens
        ]
        logger.info(f"candidate_token_ids: {candidate_token_ids}")

        query = {
            "created_by": user_id,
            "type": "replacement",
            "token_id": {"$in": candidate_token_ids},
            "suggestion": True,
        }
        logger.info(f"Query: {query}")
        annotations = await db.annotations.find(query).to_list(length=None)
        logger.info(f"Annotations to update: {len(annotations)}")

        await db.annotations.update_many(
            {"_id": {"$in": [ObjectId(a["_id"]) for a in annotations]}},
            {"$set": {"suggestion": False}},
        )

        for anno in annotations:
            text_id = anno["text_id"]
            token_id = anno["token_id"]
            if str(text_id) in text_token_ids:
                text_token_ids[str(text_id)].append(str(token_id))
            else:
                text_token_ids[str(text_id)] = [str(token_id)]
        return {"count": len(annotations), "text_token_ids": text_token_ids}
    else:
        await db.annotations.update_one(
            {
                "created_by": user_id,
                "token_id": token_id,
                "type": "replacement",
                "text_id": text_id,
            },
            {"$set": {"suggestion": False}},
        )
        text_token_ids = {str(text_id): [str(token_id)]}
        return {"count": 1, "text_token_ids": text_token_ids}


@router.patch("/add/tag")
async def add_token_tag_endpoint(
    body: AddTagBody,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Add tag to a token."""
    text_id = ObjectId(body.text_id)
    token_id = ObjectId(body.token_id)
    tag_id = ObjectId(body.tag_id)
    project_id = ObjectId(body.project_id)
    user_id = ObjectId(user.id)
    apply_all = body.apply_all

    annotation = await db.annotations.find_one(
        {
            "text_id": text_id,
            "created_by": user_id,
            "token_id": token_id,
            "value": tag_id,
            "type": "tag",
        }
    )

    text_token_ids = {}

    if apply_all:
        replacement = await db.annotations.find_one(
            {
                "created_by": user_id,
                "type": "replacement",
                "text_id": text_id,
                "token_id": token_id,
            }
        )

        if replacement:
            # Match candidates on replacement value
            value = replacement["value"]
            logger.info(f'Matching on replacement value: "{value}"')
        else:
            # Get original value of the token if no replacement exists
            token = await db.texts.aggregate(
                [
                    {"$match": {"_id": text_id}},
                    {"$unwind": "$tokens"},
                    {"$match": {"tokens._id": token_id}},
                    {"$project": {"value": "$tokens.value"}},
                ]
            ).to_list(length=None)
            token = token[0]
            value = token["value"]
            logger.info(f'Matching on original value: "{value}"')

        # Match candidates on original value
        candidates = await db.texts.aggregate(
            text_token_search_pipeline(
                project_id=project_id,
                exclude_token_ids=[token_id],
                search_value=value,
            )
        ).to_list(None)
        candidate_token_ids = {str(token["token_id"]) for token in candidates}
        logger.info(f"candidates: {candidates}")

        # Check for candidate tokens that have replacement values
        # as these are not stored in `text.tokens`
        replacements = await db.annotations.find(
            {
                "created_by": user_id,
                "type": "replacement",
                "value": value,
                "token_id": {"$ne": token_id},
            }
        ).to_list(None)
        logger.info(f'Found {len(replacements)} replacements for "{value}"')

        candidates = candidates + replacements
        candidate_token_ids = {str(token["token_id"]) for token in candidates}

        logger.info(f"Found {len(candidate_token_ids)} candidate tokens")

        # Exclude tokens that are already labelled with the tag
        annotations = await db.annotations.find(
            {
                "token_id": {"$in": [ObjectId(_id) for _id in candidate_token_ids]},
                "type": "tag",
                "value": tag_id,
                "created_by": user_id,
            }
        ).to_list(None)

        logger.info(f'Found {len(annotations)} annotations for tag "{tag_id}"')

        annotated_token_ids = {str(a["token_id"]) for a in annotations}
        logger.info(f"Annotated token ids: {annotated_token_ids}")
        update_token_ids = candidate_token_ids - annotated_token_ids
        logger.info(f"Update token ids: {update_token_ids}")

        update_operations = []
        for token in candidates:
            token_id = token["token_id"]
            if str(token_id) in update_token_ids:
                text_id = token["text_id"]
                token_id = token["token_id"]
                annotation = AnnotationDocumentModel(
                    project_id=project_id,
                    text_id=ObjectId(text_id),
                    token_id=ObjectId(token_id),
                    created_by=user_id,
                    type="tag",
                    value=tag_id,
                    suggestion=True,
                )
                update_operations.append(
                    InsertOne(annotation.model_dump(exclude_none=True))
                )

                if str(text_id) in text_token_ids:
                    text_token_ids[str(text_id)].append(str(token_id))
                else:
                    text_token_ids[str(text_id)] = [str(token_id)]

        if len(update_operations) > 0:
            await db.annotations.bulk_write(update_operations)
            return {"count": len(update_operations), "text_token_ids": text_token_ids}

    else:
        if annotation:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tag already exists for this token.",
            )
        annotation = AnnotationDocumentModel(
            project_id=project_id,
            text_id=text_id,
            token_id=token_id,
            created_by=user_id,
            type="tag",
            value=tag_id,
            suggestion=False,
        )
        await db.annotations.insert_one(annotation.model_dump(exclude_none=True))
        text_token_ids = {str(text_id): [str(token_id)]}
        return {"count": 1, "text_token_ids": text_token_ids}

    return {"count": 0, "text_token_ids": text_token_ids}


@router.patch("/remove/tag")
async def remove_token_tag_endpoint(
    body: RemoveTagBody,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Remove tag from a token."""
    text_id = ObjectId(body.text_id)
    token_id = ObjectId(body.token_id)
    tag_id = ObjectId(body.tag_id)
    project_id = ObjectId(body.project_id)
    user_id = ObjectId(user.id)
    apply_all = body.apply_all

    text_token_ids = {}

    if apply_all:
        replacement = await db.annotations.find_one(
            {
                "created_by": user_id,
                "type": "replacement",
                "text_id": text_id,
                "token_id": token_id,
            }
        )

        if replacement:
            # Match candidates on replacement value
            value = replacement["value"]
            logger.info(f'Matching on replacement value: "{value}"')
        else:
            # Get original value of the token if no replacement exists
            token = await db.texts.aggregate(
                [
                    {"$match": {"_id": text_id}},
                    {"$unwind": "$tokens"},
                    {"$match": {"tokens._id": token_id}},
                    {"$project": {"value": "$tokens.value"}},
                ]
            ).to_list(length=None)
            token = token[0]
            value = token["value"]
            logger.info(f'Matching on original value: "{value}"')

        # Match candidates on original value
        candidates = await db.texts.aggregate(
            text_token_search_pipeline(
                project_id=project_id,
                search_value=value,
            )
        ).to_list(None)
        candidate_token_ids = {str(token["token_id"]) for token in candidates}
        logger.info(f"candidates: {len(candidates)}")

        # Check for candidate tokens that have replacement values
        # as these are not stored in `text.tokens`
        replacements = await db.annotations.find(
            {
                "created_by": user_id,
                "type": "replacement",
                "value": value,
                "token_id": {"$ne": token_id},
            }
        ).to_list(None)
        logger.info(f'Found {len(replacements)} replacements for "{value}"')

        candidates = candidates + replacements
        candidate_token_ids = {str(token["token_id"]) for token in candidates}

        logger.info(f"Found {len(candidate_token_ids)} candidate tokens")

        # Delete tags
        await db.annotations.delete_many(
            {
                "created_by": user_id,
                "type": "tag",
                "value": tag_id,
                "token_id": {
                    "$in": [ObjectId(_id) for _id in candidate_token_ids] + [token_id]
                },
            }
        )

        for _token in candidates:
            _token_id = _token["token_id"]
            if str(_token_id) in candidate_token_ids:
                _text_id = _token["text_id"]
                _token_id = _token["token_id"]

                if str(_text_id) in text_token_ids:
                    text_token_ids[str(_text_id)].append(str(_token_id))
                else:
                    text_token_ids[str(_text_id)] = [str(_token_id)]

        if str(text_id) in text_token_ids:
            text_token_ids[str(text_id)].append(str(token_id))
        else:
            text_token_ids[str(text_id)] = [str(token_id)]

        return {"count": len(candidate_token_ids) + 1, "text_token_ids": text_token_ids}

    else:
        annotation = await db.annotations.find_one(
            {
                "value": tag_id,
                "text_id": text_id,
                "created_by": user_id,
                "token_id": token_id,
                "type": "tag",
            }
        )
        logger.info(f"Annotation: {annotation}")
        if annotation:
            await db.annotations.delete_one({"_id": ObjectId(annotation["_id"])})
            text_token_ids = {str(text_id): [str(token_id)]}
            return {"count": 1, "text_token_ids": text_token_ids}
        else:
            return {"count": 0, "text_token_ids": text_token_ids}
    return {"count": 0, "text_token_ids": text_token_ids}
