"""Texts router."""

import logging

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from pymongo import UpdateOne
from src.annotations.schemas import AnnotationDocumentModel
from src.config import config
from src.dependencies import get_db, get_user
from src.texts.schemas import TextOut
from src.texts.utils import OpenAIAPIException, get_gpt_correction
from src.users.schemas import UserDocumentModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix=f"{config.api.prefix}/texts", tags=["Texts"])


@router.get("/{project_id}")
async def get_texts_endpoint(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
    limit: int = Query(default=10, ge=-1, le=50),
    skip: int = Query(default=0, ge=0),
    order: int = Query(default=1, ge=-1, le=1),
    # search_term: str = Query(default=None, min_length=1),
    # reference_search_term: str = Query(default=None, min_length=1),
    # saved: bool | None = Query(default=None),
    # candidates: bool | None = Query(default=None),
    # rank: int = Query(default=1, le=1, ge=-1),
):

    user_id = ObjectId(user.id)

    project = await db.projects.find_one(
        {
            "_id": ObjectId(project_id),
            "$or": [
                {"created_by": ObjectId(user.id)},
                {
                    "annotators": {
                        "$elemMatch": {"_id": ObjectId(user.id), "status": "accepted"}
                    }
                },
            ],
        }
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    logger.info(f"User is on project")

    match_stage = {"project_id": ObjectId(project_id)}
    # if search_term:
    #     match_stage["original"] = {"$regex": search_term, "$options": "i"}
    # if reference_search_term:
    #     match_stage["reference_search_term"] = {"$regex": reference_search_term, "$options": "i"}
    # if saved is not None:
    #     match_stage["saved"] = saved
    # if candidates is not None:
    #     match_stage["candidates"] = candidates

    post_texts_pipeline = [
        {
            "$lookup": {
                "from": "annotations",
                "let": {"textId": "$_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$text_id", "$$textId"]},
                                    {"$eq": ["$created_by", user_id]},
                                ]
                            }
                        }
                    }
                ],
                "as": "annotations",
            }
        }
    ]

    pre_texts_pipeline = [
        {"$skip": skip},
        {"$sort": {"rank": order}},
    ]
    if limit != -1:
        pre_texts_pipeline.append({"$limit": limit})

    pipeline = [
        {"$match": match_stage},
        {
            "$facet": {
                "texts": pre_texts_pipeline + post_texts_pipeline,
                "totalCount": [{"$count": "count"}],
            }
        },
        {
            "$project": {
                "texts": 1,
                "totalCount": {"$arrayElemAt": ["$totalCount.count", 0]},
            }
        },
    ]

    result = await db.texts.aggregate(pipeline).to_list(length=None)
    result = result[0]
    total_count = result.get("totalCount", 0)
    texts = result.get("texts", [])
    # texts = [TextOut(**t) for t in result.get("texts", [])]

    logger.info(result)

    for text in texts:
        text["saved"] = False
        text["flags"] = []
        _tokens = [
            {
                **token,
                "current_value": token["value"],
                "tags": [],
                "replacement": None,
                "suggestion": None,
            }
            for token in text["tokens"]
        ]

        for annotation in text["annotations"]:
            annotation_type = (
                "tags" if annotation["type"] == "tag" else annotation["type"]
            )
            token_annotation = "token_id" in annotation

            if token_annotation:
                token = next(
                    (
                        t
                        for t in _tokens
                        if str(t["_id"]) == str(annotation["token_id"])
                    ),
                    None,
                )
                if annotation_type == "replacement":
                    if annotation.get("suggestion", False):
                        print("adding suggested replacement...")
                        token["suggestion"] = annotation["value"]
                    else:
                        print("adding replacement...")
                        token[annotation_type] = annotation["value"]
                    token["current_value"] = annotation["value"]
                elif annotation_type == "tags":
                    token[annotation_type].append(annotation["value"])
                else:
                    print(f"Unhandled annotation type: {annotation_type}")
            else:
                if annotation_type == "flag":
                    text["flags"].append(annotation["value"])
                elif annotation_type == "save":
                    text["saved"] = annotation["value"]
                else:
                    raise ValueError(f"Unhandled annotation type: {annotation_type}")
        text["tokens"] = _tokens
        text.pop("annotations")

    return {
        "total_count": total_count,
        "texts": [TextOut(**text) for text in texts],
    }


class SaveTextsBody(BaseModel):
    ids: list[str] = Body(min_length=1)
    save: bool
    project_id: str


@router.patch("/save")
async def save_text_endpoint(
    body: SaveTextsBody,
    user: UserDocumentModel = Depends(get_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        text_ids = [ObjectId(_id) for _id in body.ids]
        save = body.save
        project_id = ObjectId(body.project_id)
        user_id = ObjectId(user.id)

        if save:
            # User is trying to add save state
            bulk_ops = [
                UpdateOne(
                    {"created_by": user_id, "text_id": t_id, "type": "save"},
                    {
                        "$setOnInsert": AnnotationDocumentModel(
                            type="save",
                            suggestion=False,
                            value=True,
                            text_id=t_id,
                            project_id=project_id,
                            token_id=None,
                            created_by=user_id,
                        ).model_dump(exclude_none=True)
                    },
                    upsert=True,
                )
                for t_id in text_ids
            ]

            await db.annotations.bulk_write(bulk_ops)
        else:
            # User is trying to remove save state
            await db.annotations.delete_many(
                {
                    "created_by": user_id,
                    "text_id": {"$in": text_ids},
                    "type": "save",
                }
            )

        return {"updated": True}
    except Exception as e:
        logger.info(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


class FlagTextsBody(BaseModel):
    id: str
    flag_id: str
    project_id: str


@router.patch("/flag")
async def flag_text_endpoint(
    body: FlagTextsBody,
    user: UserDocumentModel = Depends(get_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Flag a text."""
    user_id = ObjectId(user.id)
    text_id = ObjectId(body.id)
    flag_id = ObjectId(body.flag_id)
    project_id = ObjectId(body.project_id)
    flag = await db.annotations.find_one(
        {"text_id": text_id, "type": "flag", "created_by": user_id, "value": flag_id}
    )

    if flag:
        await db.annotations.delete_one({"_id": flag["_id"]})
    else:
        await db.annotations.insert_one(
            AnnotationDocumentModel(
                type="flag",
                suggestion=False,
                value=flag_id,
                text_id=text_id,
                project_id=project_id,
                token_id=None,
                created_by=user_id,
            ).model_dump(exclude_none=True)
        )

    return "hello"


@router.get("/{text_id}/suggestion")
async def get_suggestion_endpoint(
    text_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Get suggestions for a text"""
    try:
        if user.openai_api_key is None or user.openai_api_key == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="OpenAI key not set"
            )

        # Get current text content
        text = await db.texts.find_one(
            {"_id": ObjectId(text_id), "created_by": ObjectId(user.id)}
        )

        # Get replacements on the text
        replacements = await db.annotations.find(
            {"text_id": ObjectId(text_id), "type": "replacement"}
        ).to_list(None)
        token_id_to_replacement = {r["token_id"]: r["value"] for r in replacements}

        current_text = []
        for token in text["tokens"]:
            if token["_id"] in token_id_to_replacement:
                current_text.append(token_id_to_replacement[token["_id"]])
            else:
                current_text.append(token["value"])

        # Make prediction on the current text tokens
        prediction = await get_gpt_correction(
            " ".join(current_text), user.openai_api_key
        )

        return prediction
    except OpenAIAPIException as e:
        # Handle OpenAI API specific errors
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except ValueError as e:
        # Handle value errors (including JSON parsing errors)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
    except Exception as e:
        # Handle any other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )
