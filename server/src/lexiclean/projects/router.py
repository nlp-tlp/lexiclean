"""Project router."""

import itertools
import json
import logging
import math
import re
import string
from collections import defaultdict
from difflib import SequenceMatcher
from itertools import combinations
from typing import Any, DefaultDict, Dict, List, Literal, Optional, Tuple, Union

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field
from pymongo import InsertOne

from lexiclean.annotations.schemas import AnnotationDocumentModel
from lexiclean.config import config
from lexiclean.dependencies import get_db, get_user
from lexiclean.projects.schemas import (
    Annotator,
    CorpusPreprocessing,
    Flag,
    Metrics,
    ProjectCreate,
    ProjectDocumentModel,
    ProjectOut,
    ProjectOutWithResources,
    ProjectUpdate,
    ProjectUserOut,
    Tag,
)
from lexiclean.projects.services import get_project, rank_texts
from lexiclean.resources.schemas import ResourceDocumentModel, ResourceOut
from lexiclean.texts.schemas import TextDocumentModel, Token
from lexiclean.users.schemas import UserDocumentModel, UserOut
from lexiclean.utils import text_token_search_pipeline

logger = logging.getLogger(__name__)


router = APIRouter(prefix=f"{config.api.prefix}/projects", tags=["Projects"])


@router.post("", response_model=ProjectOutWithResources)
async def create_project_endpoint(
    body: ProjectCreate,
    user: UserDocumentModel = Depends(get_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> ProjectOutWithResources:
    logger.info(f"Creating project: {body}")

    tags = body.tags
    flags = body.flags
    body.tags = []
    body.flags = []

    body.annotators: List[Annotator] = [
        {"_id": ObjectId(user.id), "status": "accepted"}
    ]  # + [ObjectId(a) for a in body.annotators]

    inserted_project = await db.projects.insert_one(
        ProjectDocumentModel(
            **body.model_dump(),
            created_by=user.id,
            metrics=Metrics(
                initial_vocab_size=0,
                initial_candidate_vocab_size=0,
                initial_token_count=0,
            ),
        ).model_dump(by_alias=True, exclude_none=True)
    )

    # Get English lexicon
    english_lexicon = config.english_lexicon
    logger.info(f"English lexicon size: {len(english_lexicon)}")

    resource_dictionaries: Dict[str, List[str]] = {"en": english_lexicon}

    # Create replacements resource
    # await db.resources.insert_one()

    resource_dictionaries["rp"] = body.replacements.values

    # Add tags to db
    tag_resources = []
    for t in tags:
        logger.info(f"Creating tag: {t}")
        _tag_model = ResourceDocumentModel(
            **t.model_dump(by_alias=True),
            created_by=user.id,
            type="tag",
            project_id=inserted_project.inserted_id,
        )

        tag_resources.append(
            InsertOne(_tag_model.model_dump(by_alias=True, exclude={"id"}))
        )
    if len(tag_resources) > 0:
        await db.resources.bulk_write(tag_resources)
    db_tags = await db.resources.find(
        {"project_id": ObjectId(inserted_project.inserted_id), "type": "tag"}
    ).to_list(length=None)
    tag_ids = [tag["_id"] for tag in db_tags]
    logger.info(f"Created tags: {tag_ids}")

    # Add flags to db
    flag_resources = []
    for f in flags:
        logger.info(f"Creating flag: {f}")
        _flag_model = ResourceDocumentModel(
            **f.model_dump(by_alias=True),
            values=[],  # Flags do not have values
            created_by=user.id,
            type="flag",
            color="#ff0000",
            project_id=inserted_project.inserted_id,
        )

        flag_resources.append(
            InsertOne(_flag_model.model_dump(by_alias=True, exclude={"id"}))
        )
    if len(flag_resources) > 0:
        await db.resources.bulk_write(flag_resources)
    db_flags = await db.resources.find(
        {"project_id": ObjectId(inserted_project.inserted_id), "type": "flag"}
    ).to_list(length=None)
    flag_ids = [flag["_id"] for flag in db_flags]
    logger.info(f"Created flags: {flag_ids}")

    # Process texts
    texts = body.texts
    logger.info(f"processing {len(texts)} texts")

    def normalise_text(preprocessing_settings: CorpusPreprocessing, text: str) -> str:
        # Remove tabs
        text = text.replace("\t", " ")
        # Lowercase
        if preprocessing_settings.lowercase:
            text = text.lower()
        # Remove leading and trailing whitespace
        text = text.strip()
        # Remove superfluous whitespace
        text = " ".join(text.split())

        if preprocessing_settings.remove_punctuation:
            # Remove punctuation
            text = "".join([c for c in text if c not in string.punctuation])

        if len(preprocessing_settings.remove_content) > 0:
            # Remove words and phrases
            text = re.sub(
                "|".join(map(re.escape, preprocessing_settings.remove_content)),
                "",
                text,
            )

        return text.strip()

    normalised_texts = {
        _id: normalise_text(
            preprocessing_settings=body.settings.preprocessing, text=text
        )
        for _id, text in texts.items()
        if normalise_text(preprocessing_settings=body.settings.preprocessing, text=text)
    }

    logger.info(f"Normalised texts (1): {normalised_texts}")

    # filter out any duplicates or empty strings
    def remove_duplicates(remove, texts):
        """
        Remove or retain duplicates in texts.

        :param remove: Boolean indicating whether to remove duplicates.
        :param texts: Dictionary of text objects {id: text}
        :returns: List of text objects [{'text': '', 'ids': []}]
        """
        if remove:
            filtered_texts = defaultdict(list)
            for id, text in texts.items():
                filtered_texts[text].append(id)

            filtered_texts = [
                {"text": text, "ids": ids} for text, ids in filtered_texts.items()
            ]
        else:
            filtered_texts = [{"text": text, "ids": [id]} for id, text in texts.items()]

        logger.info("Text pre-processing: Removed duplicates")
        return filtered_texts

    normalised_texts = remove_duplicates(
        remove=body.settings.preprocessing.remove_duplicates, texts=normalised_texts
    )
    logger.info(f"Normalised texts (2): {normalised_texts}")

    # Extract tokens from texts and create token objects
    text_operations = []
    out_of_vocab_candidate_tokens = []
    token_annotations = []
    for text_index, text in enumerate(normalised_texts):
        tokens = []
        for token_index, token in enumerate(text["text"].split()):
            in_vocab = False
            is_candidate_token = False
            # Check if token is in English lexicon
            if token in english_lexicon:
                in_vocab = True
            # Check if user has set digits to be included in vocab
            if body.settings.digits_in_vocab:
                if token.isdigit():
                    in_vocab = True
            # Check if token is a special token
            if token in body.settings.special_tokens:
                in_vocab = True

            if not in_vocab:
                is_candidate_token = True

            # Automatically transform token with replacement if available
            if body.settings.preannotation.replacements:
                logger.info(f"Checking token: {token}")
                if token in resource_dictionaries["rp"]:
                    is_candidate_token = True
                    logger.info(
                        f'Replacing token: "{token}" with "{body.replacements.values[token]}"'
                    )
                    token_annotations.append(
                        {
                            "type": "replacement",
                            "value": body.replacements.values[token],
                            "token_index": token_index,
                            "text_index": text_index,
                        }
                    )

            if body.settings.preannotation.tags:
                logger.info(f"Tagging token: {token}")
                for idx, tag in enumerate(tags):
                    values = set(tag.values)
                    logger.info(f"Tag values: {values}")
                    if token in values:
                        logger.info(f"Adding tag: {tag.name} to token: {token}")
                        token_annotations.append(
                            {
                                "type": "tag",
                                "value": tag_ids[idx],
                                "token_index": token_index,
                                "text_index": text_index,
                            }
                        )

            if is_candidate_token:
                out_of_vocab_candidate_tokens.append(token)

            tokens.append(Token(index=token_index, value=token, in_vocab=in_vocab))

        text_operations.append(
            InsertOne(
                TextDocumentModel(
                    original=text["text"],
                    weight=0,
                    rank=0,
                    identifiers=text["ids"],
                    project_id=ObjectId(inserted_project.inserted_id),
                    tokens=tokens,
                    created_by=user.id,
                ).model_dump(exclude={"id"}, by_alias=True)
            )
        )

    if len(text_operations) > 0:
        await db.texts.bulk_write(text_operations)

    db_texts = await db.texts.find(
        {"project_id": ObjectId(inserted_project.inserted_id)}
    ).to_list(length=None)
    logger.info(db_texts)

    # Create annotation objects
    annotation_operations = []
    for a in token_annotations:
        text_id = db_texts[a["text_index"]]["_id"]
        token_id = db_texts[a["text_index"]]["tokens"][a["token_index"]]["_id"]

        annotation = AnnotationDocumentModel(
            **a,
            created_by=user.id,
            project_id=ObjectId(inserted_project.inserted_id),
            token_id=token_id,
            text_id=text_id,
            suggestion=body.settings.preannotation.suggested,
        )

        annotation_operations.append(
            InsertOne(annotation.model_dump(by_alias=True, exclude={"id"}))
        )
    if len(annotation_operations) > 0:
        await db.annotations.bulk_write(annotation_operations)

    # Calculate project metrics
    initial_token_count = list(
        itertools.chain.from_iterable([t["text"].split() for t in normalised_texts])
    )
    metrics = Metrics(
        initial_vocab_size=len(set(initial_token_count)),
        initial_candidate_vocab_size=len(out_of_vocab_candidate_tokens),
        initial_token_count=len(initial_token_count),
    )

    # Update project
    await db.projects.update_one(
        {"_id": ObjectId(inserted_project.inserted_id)},
        {"$set": {"tags": tag_ids, "metrics": metrics.model_dump(), "flags": flag_ids}},
    )
    logger.info(f"Updated project: {inserted_project.inserted_id}")

    # Perform text weighting and ranking
    if body.settings.ranking:
        logger.info(f"Ranking {len(db_texts)} texts")
        await rank_texts(
            db=db, texts=db_texts, candidate_tokens=out_of_vocab_candidate_tokens
        )

    project = await get_project(
        db, ObjectId(inserted_project.inserted_id), ObjectId(user.id)
    )

    logger.info(f"Creating project: {body}")
    return project


@router.get("")
async def get_projects_endpoint(
    limit: int = Query(default=10, ge=-1, le=100),
    skip: int = Query(default=0, ge=0),
    order: int = Query(default=-1, ge=-1, le=1),
    user: UserDocumentModel = Depends(get_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get a list of projects."""

    projects_pipeline = [
        {"$project": {"resources": 0}},
        {"$skip": skip},
        {"$sort": {"created_at": order}},
    ]
    if limit != -1:
        projects_pipeline.append({"$limit": limit})

    match_query = {
        "$match": {
            "$or": [
                {"created_by": ObjectId(user.id)},
                {
                    "annotators": {
                        "$elemMatch": {"_id": ObjectId(user.id), "status": "accepted"}
                    }
                },
            ]
        }
    }

    pipeline = [
        match_query,
        {
            "$facet": {
                "projects": projects_pipeline,
                "totalCount": [{"$count": "count"}],
            }
        },
        {
            "$project": {
                "projects": 1,
                "totalCount": {"$arrayElemAt": ["$totalCount.count", 0]},
            }
        },
    ]

    # Get count of texts on the projects
    text_pipeline = [
        match_query,
        {"$group": {"_id": "$project_id", "count": {"$sum": 1}}},
    ]
    text_counts = await db.texts.aggregate(text_pipeline).to_list(length=None)
    text_counts = {str(t["_id"]): t["count"] for t in text_counts}

    result = await db.projects.aggregate(pipeline).to_list(length=None)
    result = result[0]
    logger.info(f"result: {result}")

    if len(result["projects"]) == 0:
        return {
            "total_count": 0,
            "projects": [],
        }

    # Get count of saves per text on each project
    save_pipeline = [
        match_query,
        {
            "$match": {
                "type": "save",
                "value": True,
            }
        },
        {
            "$group": {
                "_id": {"text_id": "$text_id", "project_id": "$project_id"},
                "saves": {"$sum": 1},
            }
        },
        {"$group": {"_id": "$_id.project_id", "saved_texts": {"$sum": 1}}},
        {
            "$project": {
                "_id": 0,
                "project_id": {"$toString": "$_id"},
                "saved_texts": 1,
            }
        },
    ]

    save_counts = await db.annotations.aggregate(save_pipeline).to_list(length=None)
    logger.info(f"save_counts: {save_counts}")
    save_dict = {item["project_id"]: item["saved_texts"] for item in save_counts}
    logger.info(f"save_dict: {save_dict}")

    projects_out = []
    for project in result.get("projects", []):
        project_id = str(project["_id"])
        projects_out.append(
            ProjectOut(
                **project,
                texts=text_counts.get(project_id, 0),
                saved_texts=save_dict.get(project_id, 0),
            )
        )

    return {
        "total_count": result.get("totalCount", 0),
        "projects": projects_out,
    }


@router.delete("/{project_id}")
async def delete_project_endpoint(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    project = await db.projects.find_one({"_id": ObjectId(project_id)})

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    await db.projects.delete_one({"_id": ObjectId(project_id)})

    # Delete annotations
    await db.annotations.delete_many({"project_id": ObjectId(project_id)})
    # Delete texts
    await db.texts.delete_many({"project_id": ObjectId(project_id)})
    # Delete resources
    await db.resources.delete_many({"project_id": ObjectId(project_id)})

    return {"message": f"Deleted project: {project_id}"}


@router.patch("/{project_id}")
async def update_project_endpoint(
    project_id: str,
    body: ProjectUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    project = await db.projects.find_one({"_id": ObjectId(project_id)})

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    logger.info(f"Updating project: {project_id} with {body}")

    update_result = await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": body.model_dump(exclude_none=True)},
    )

    if update_result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_304_NOT_MODIFIED,
            detail="Project update failed or data was identical",
        )

    updated_project = await db.projects.find_one({"_id": ObjectId(project_id)})

    logger.info(f"Updated project: {project_id}")
    return ProjectOut(**updated_project)


@router.get("/{project_id}")
async def get_project_endpoint(
    project_id: str,
    user: UserDocumentModel = Depends(get_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get a single project."""
    project = await get_project(db, ObjectId(project_id), ObjectId(user.id))
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    return project


@router.get("/{project_id}/progress")
async def get_project_progress_endpoint(
    project_id: str,
    user: UserDocumentModel = Depends(get_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get the progress for a single user."""
    project_id = ObjectId(project_id)

    project = await get_project(db, project_id, ObjectId(user.id))
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    total_texts = await db.texts.count_documents({"project_id": ObjectId(project_id)})

    if total_texts == 0:
        return {"value": 0, "title": "0/0"}

    saved_texts = await db.annotations.count_documents(
        {
            "created_by": user.id,
            "project_id": ObjectId(project_id),
            "type": "save",
            "value": True,
        }
    )

    progress = {
        "value": round((saved_texts / total_texts) * 100),
        "title": f"{saved_texts}/{total_texts}",
    }

    return progress


@router.get("/{project_id}/summary")
async def get_project_summary(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    try:
        project_id = ObjectId(project_id)

        project: ProjectOutWithResources | None = await get_project(
            db, project_id, ObjectId(user.id)
        )

        if project is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
            )

        logger.info(f"project: {project}")

        annotators = project.annotators
        logger.info(f"annotators: {annotators}")

        texts = await db.texts.find({"project_id": project_id}).to_list(length=None)
        text_ids = [ObjectId(t["_id"]) for t in texts]

        saved_texts = await db.annotations.find(
            {"text_id": {"$in": text_ids}, "type": "save"}
        ).to_list(length=None)
        logger.info(f"saved_texts: {saved_texts}")

        def annotations_with_tokens_pipeline(type, suggestion, text_ids):
            return [
                {
                    "$match": {
                        "type": type,
                        "suggestion": suggestion,
                        "text_id": {"$in": text_ids},
                    }
                },
                {
                    "$lookup": {
                        "from": "texts",
                        "localField": "text_id",
                        "foreignField": "_id",
                        "as": "text",
                    }
                },
                {"$unwind": "$text"},
                {
                    "$addFields": {
                        "filteredTokens": {
                            "$filter": {
                                "input": "$text.tokens",
                                "as": "token",
                                "cond": {"$eq": ["$$token._id", "$token_id"]},
                            }
                        }
                    }
                },
                {"$unwind": "$filteredTokens"},
                {
                    "$addFields": {
                        "filteredTokens.current_value": "$value",
                        "filteredTokens.original_value": "$filteredTokens.value",
                        "filteredTokens.text_id": "$text_id",
                        "filteredTokens.created_by": "$created_by",
                        "filteredTokens.annotation_id": "$_id",
                    }
                },
                {"$replaceRoot": {"newRoot": "$filteredTokens"}},
                {"$addFields": {"token_id": "$_id"}},
                {"$project": {"_id": 0, "index": 0, "value": 0}},
            ]

        populated_replacements = await db.annotations.aggregate(
            annotations_with_tokens_pipeline(
                type="replacement", suggestion=False, text_ids=text_ids
            )
        ).to_list(length=None)

        logger.info(f"populated_replacements: {len(populated_replacements)}")

        annotator_id_to_username = {str(a.id): a.username for a in project.annotators}
        logger.info(f"annotator_id_to_username: {annotator_id_to_username}")

        replacements_by_user = {}
        for r in populated_replacements:
            replacement_key = f"{r['original_value']}->{r['current_value']}"
            user_key = annotator_id_to_username[str(r["created_by"])]

            if replacement_key not in replacements_by_user:
                replacements_by_user[replacement_key] = {
                    "id": str(r["annotation_id"]),
                    "input": r["original_value"],
                    "output": r["current_value"],
                    "used_by": {user_key: 1},
                    "new": False,
                }
            else:
                if user_key not in replacements_by_user[replacement_key]["used_by"]:
                    replacements_by_user[replacement_key]["used_by"][user_key] = 1
                else:
                    replacements_by_user[replacement_key]["used_by"][user_key] += 1

        logger.info(f"replacements_by_user: {replacements_by_user}")

        replacement_history = list(replacements_by_user.values())
        logger.info(f"replacement_history: {replacement_history}")

        # Get token counts vocabular, etc.
        replacements = await db.annotations.find(
            {
                "type": "replacement",
                "created_by": ObjectId(user.id),
                "suggestion": False,
                "text_id": {"$in": text_ids},
            }
        ).to_list(length=None)

        empty_tokens = 0

        replacement_token_ids = []
        replacement_tokens = []

        for r in replacements:
            replacement_token_ids.append(ObjectId(r["token_id"]))
            if r["value"] != "":
                replacement_tokens.append(r["value"])
            else:
                empty_tokens += 1

        logger.info(f"replacement_tokens: {replacement_tokens}")
        logger.info(f"empty_tokens: {empty_tokens}")

        # Get all tokens except those that have been transformed (replaced)
        all_tokens = await db.texts.aggregate(
            text_token_search_pipeline(
                project_id=project_id, exclude_token_ids=replacement_token_ids
            )
        ).to_list(length=None)

        logger.info(f"all_tokens: {len(all_tokens)}")

        tokens = []
        in_vocab_tokens = 0

        for t in all_tokens:
            if t["value"] != "":
                tokens.append(t["value"])
                in_vocab_tokens += 1 if t["in_vocab"] else 0
            else:
                empty_tokens += 1

        logger.info(f"tokens: {len(tokens)}")
        logger.info(f"in_vocab_tokens: {in_vocab_tokens}")
        logger.info(f"empty_tokens: {empty_tokens}")

        # Filter out empty strings (placeholders for removed tokens)
        # these shouldn't influence counts, etc.
        vocab = set(token for token in tokens if token != "")
        vocab_size = len(vocab)
        logger.info(f"vocab_size: {vocab_size}")

        current_iv_tokens = in_vocab_tokens + len(replacement_tokens)
        logger.info(f"current_iv_tokens: {current_iv_tokens}")

        current_oov_tokens = len(tokens) + len(replacement_tokens) - current_iv_tokens
        logger.info(f"current_oov_tokens: {current_oov_tokens}")

        current_token_count = len([t for t in tokens if t != ""]) + len(
            [t for t in replacement_tokens if t != ""]
        )
        logger.info(f"current_token_count: {current_token_count}")

        corrections_made = len(replacement_tokens)

        metrics = [
            {
                "name": "Total Texts",
                "value": len(texts),
                "description": "Total number of texts within the project's corpus.",
            },
            {
                "name": "Texts Annotated",
                "value": len(saved_texts),
                "description": "Number of texts where changes have been reviewed and saved by annotators.",
            },
            {
                "name": "Annotation Progress",
                "value": round((len(saved_texts) / len(texts)) * 100),
                "description": "Percentage of the project's texts that have been saved, indicating overall progress.",
            },
            {
                "name": "Initial Vocabulary Size",
                "value": project.metrics.initial_vocab_size,
                "description": "The size of the vocabulary at the start of the project, before any annotations or normalisations.",
            },
            {
                "name": "Adjusted Vocabulary Size",
                "value": vocab_size,
                "description": "The current size of the vocabulary after applying corrections and normalisations.",
            },
            {
                "name": "Vocabulary Reduction Rate",
                "value": round(
                    (
                        (project.metrics.initial_vocab_size - vocab_size)
                        / project.metrics.initial_vocab_size
                    )
                    * 100
                ),
                "description": "Percentage reduction in vocabulary size from the start of the project to the current state.",
            },
            {
                "name": "Initial Token Count",
                "value": project.metrics.initial_token_count,
                "description": "Total number of tokens across all texts at the project's outset.",
            },
            {
                "name": "Current Token Count",
                "value": current_token_count,
                "description": "Current total number of tokens across all texts, reflecting any additions or deletions.",
            },
            {
                "name": "Corrections Applied",
                "value": corrections_made,
                "description": "Total number of corrections or normalizations applied to tokens throughout the project.",
            },
            {
                "name": "Unnormalised Tokens",
                "value": current_oov_tokens,
                "description": "Current number of out-of-vocabulary (OOV) tokens that have not yet been normalised or corrected.",
            },
            {
                "name": "Inter-Annotator Agreement",
                "value": "TBD",
                "description": "The consistency of annotations across different annotators. A higher percentage indicates greater agreement and reliability of the annotations.",
            },
            {
                "name": "Greatest Contributor",
                "value": "TBD",
                "description": "The annotator who has made the most contributions (annotations or corrections) to the project.",
            },
        ]

        return {
            "is_admin": str(user.id) == str(project.created_by.id),
            "details": {
                "created_by": project.created_by,
                "name": project.name,
                "description": project.description,
                "flags": project.flags,
                "tags": project.tags,
                "specialTokens": project.settings.special_tokens,
                "preprocessing": {
                    "lowercase": True,
                    "removePunctuation": True,
                    "removeChars": [],
                    "removeDuplicates": True,
                },
                "created_at": project.created_at,
                "updated_at": project.updated_at,
                "parallelCorpus": False,
            },
            "annotators": project.annotators,
            "metrics": metrics,
            "lists": {"replacementHistory": replacement_history},
        }
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve project summary",
        )


@router.get("/{project_id}/search")
async def search_tokens_endpoint(
    project_id: str,
    value: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Search for tokens to find matches on a given value in a project."""
    user_id = ObjectId(user.id)
    project_id = ObjectId(project_id)
    logger.info(f"search_tokens_endpoint: {project_id}, {value}, {user_id}")

    pipeline = [
        {"$match": {"project_id": project_id}},
        {
            "$project": {
                "tokens": {
                    "$filter": {
                        "input": "$tokens",
                        "as": "token",
                        "cond": {
                            "$regexMatch": {
                                "input": "$$token.value",
                                "regex": re.escape(value),
                                "options": "i",
                            }
                        },
                    }
                },
                "_id": 1,
            }
        },
        {"$unwind": "$tokens"},
        {"$addFields": {"tokens.text_id": "$_id"}},
        {"$replaceRoot": {"newRoot": "$tokens"}},
        {"$addFields": {"token_id": "$_id"}},
        {"$project": {"_id": 0}},
    ]

    # Find matching tokens across the corpus on their original value
    matching_tokens = await db.texts.aggregate(pipeline).to_list(length=None)
    token_ids = [ObjectId(t["token_id"]) for t in matching_tokens]

    # Find annotations for the matching tokens
    annotations = await db.annotations.find(
        {"created_by": user_id, "token_id": {"$in": token_ids}}
    ).to_list(length=None)

    # Step 1: Aggregate the data
    aggregation = {}
    for anno in annotations:
        key = (anno["type"], anno.get("suggested", False))
        logger.info(f"key: {key}")
        if key not in aggregation:
            aggregation[key] = {}
        value = str(anno["value"])
        if value not in aggregation[key]:
            aggregation[key][value] = 0
        aggregation[key][value] += 1

    # Step 2: Transform the aggregation into the desired output format
    return [
        {"type": k[0], "suggested": k[1], "values": v} for k, v in aggregation.items()
    ]


@router.post("/{project_id}/tags")
async def add_project_tags_endpoint(
    project_id: str,
    tag: Tag,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Add a tag to a project."""

    project_id = ObjectId(project_id)

    project = await get_project(db, project_id, ObjectId(user.id))

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    logger.info(f"project tags: {project.tags}")
    project_tag_names = [t.name for t in project.tags]
    # Check if tags already exist by name:
    valid_tag = tag.name not in project_tag_names
    if not valid_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag already exists on project",
        )

    logger.info(tag)

    # Create tag in resources and assign to project
    tag_resource = ResourceDocumentModel(
        **tag.model_dump(by_alias=True),
        created_by=ObjectId(user.id),
        type="tag",
        project_id=project_id,
    )

    tag_resource = await db.resources.insert_one(
        tag_resource.model_dump(by_alias=True, exclude={"id"})
    )

    await db.projects.update_one(
        {"_id": project_id},
        {"$push": {"tags": tag_resource.inserted_id}},
    )

    new_tag = await db.resources.find_one({"_id": ObjectId(tag_resource.inserted_id)})

    return ResourceOut(**new_tag)


async def get_texts_with_user_annotations(
    db: AsyncIOMotorDatabase,
    project_id: ObjectId,
    annotators: Union[List[UserOut], List[ProjectUserOut]],
    tag_id_to_name: Dict[str, str],
    flag_id_to_name: Dict[str, str],
    skip: Optional[int] = None,
    limit: int = 1,
):
    """
    Get texts with annotations made by users.

    Aligns annotations made by users to the texts they are raised against.
    This is useful for IAA calculation and downloads. The function allows
    optional skipping of a specified number of texts at the beginning of
    the text list, which can be useful for pagination or selective processing.
    """

    texts_pipeline = [
        {"$match": {"project_id": project_id}},
        {"$sort": {"created_at": 1}},
    ]

    if skip is not None:
        texts_pipeline.append({"$skip": skip})

    if limit != -1:
        texts_pipeline.append({"$limit": limit})

    texts = await db.texts.aggregate(texts_pipeline).to_list(length=None)
    if texts is None or len(texts) == 0:
        return None
    text_ids = [ObjectId(text["_id"]) for text in texts]
    logger.info(f"text_ids: {text_ids}")

    # Get all annotations on the text
    annotations = await db.annotations.find({"text_id": {"$in": text_ids}}).to_list(
        length=None
    )
    logger.info(f"annotations: {len(annotations)}")

    # Separate token annotations and text annotations programmatically
    text_annotations = [a for a in annotations if "token_id" not in a]
    token_annotations = [a for a in annotations if "token_id" in a]
    logger.info(f"found {len(text_annotations)} text annotations")
    logger.info(f"found {len(token_annotations)} token annotations")

    # Convert annotations into {annotatorId: {textId: {tokenId: [annotations]}}} format
    token_annotations_by_user = defaultdict(
        lambda: defaultdict(
            lambda: defaultdict(lambda: {"tag": [], "replacement": None})
        )
    )
    for a in token_annotations:
        created_by = str(a["created_by"])
        text_id = str(a["text_id"])
        token_id = str(a["token_id"])

        # Ensure the structure is initialized without overwriting existing values
        if "tag" not in token_annotations_by_user[created_by][text_id][token_id]:
            token_annotations_by_user[created_by][text_id][token_id] = {
                "tag": [],
                "replacement": None,
            }

        if a["type"] == "tag":
            token_annotations_by_user[created_by][text_id][token_id]["tag"].append(
                tag_id_to_name[str(a["value"])]
            )

        if a["type"] == "replacement" and not a["suggestion"]:
            token_annotations_by_user[created_by][text_id][token_id]["replacement"] = a[
                "value"
            ]

    logger.info(
        f"token_annotations_by_user: {json.loads(json.dumps(token_annotations_by_user))}"
    )

    text_annotation_by_user = defaultdict(
        lambda: defaultdict(lambda: {"save": None, "flag": []})
    )

    for a in text_annotations:
        created_by = str(a["created_by"])
        text_id = str(a["text_id"])

        if a["type"] == "save":
            logger.info(f"save text anno: {a}")
            text_annotation_by_user[created_by][text_id]["save"] = a["value"]
            logger.info(
                f"after save :: text_annotation_by_user {text_annotation_by_user}"
            )

        if a["type"] == "flag":
            text_annotation_by_user[created_by][text_id]["flag"].append(
                flag_id_to_name[str(a["value"])]
            )

    logger.info(
        f"text_annotation_by_user: {json.loads(json.dumps(text_annotation_by_user))}"
    )

    # Create output annotations
    # this handles the case where some users have not tagged/replaced items, etc.
    output_annotations = []
    for text in texts:
        text_id = str(text["_id"])
        tags: Dict[str, List[str]] = {}
        replacements: Dict[str, List[str]] = {}
        flags: Dict[str, str] = {}
        saves: Dict[str, bool] = {}

        for annotator in annotators:
            annotator_id = str(annotator.id)
            logger.info(f"annotator: {annotator_id}")
            username = annotator.username
            tags[username] = []
            replacements[username] = []
            flags[username] = []
            saves[username] = []

            # Token-level annotations
            logger.info(
                f"token_annotations_by_user[annotator_id][text_id]: {token_annotations_by_user[annotator_id][text_id]}"
            )

            for token in text["tokens"]:
                logger.info(f"token: {token}")
                token_id = str(token["_id"])
                _token_annotations = token_annotations_by_user[annotator_id][text_id][
                    token_id
                ]
                logger.info(f"_token_annotations: {_token_annotations}")

                _annotator_replacement = _token_annotations.get("replacement")
                if _annotator_replacement is None:
                    _annotator_replacement = token["value"]

                replacements[username].append(_annotator_replacement)

                _annotator_tag = _token_annotations.get("tag", [])
                tags[username].append(_annotator_tag)

            # Text-level annotations
            logger.info(
                f"text_annotation_by_user[annotator_id][text_id]: {text_annotation_by_user[annotator_id][text_id]}"
            )
            if (
                annotator_id in text_annotation_by_user
                and text_id in text_annotation_by_user[annotator_id]
            ):
                _annotator_flags = text_annotation_by_user[annotator_id][text_id][
                    "flag"
                ]
                flags[username] = _annotator_flags

                _annotator_save = text_annotation_by_user[annotator_id][text_id]["save"]
                saves[username] = _annotator_save

        output_annotations.append(
            {
                "id": text_id,
                "identifiers": text["identifiers"],
                "source": text["original"],
                "source_tokens": text["original"].split(),
                "reference": text["reference"] if "reference" in text else "",
                "tags": tags,
                "replacements": replacements,
                "flags": flags,
                "saves": saves,
            }
        )

    return output_annotations


def average(arr):
    return 0 if len(arr) == 0 else sum(arr) / len(arr)


def token_similarity(token1, token2):
    if token1 == token2:
        # Shortcut and handles the case of empty strings
        return 100.0

    matcher = SequenceMatcher(None, token1, token2)
    matching_blocks = matcher.get_matching_blocks()

    matching_characters = sum(triple.size for triple in matching_blocks)
    total_characters = max(len(token1), len(token2))

    # Calculate the score as a percentage
    score = (matching_characters / total_characters) * 100

    return round(score, 2)  # Format the score to 2 decimal places


def compute_pairwise_similarity(annotations) -> Tuple[list, list, list]:
    """Calculate pairwise similarity between annotators."""
    logger.info(f"Annotations: {annotations}")

    annotator_ids = list(annotations.keys())
    pairwise_scores = []
    token_level_scores: List[List[float]] = [
        [] for _ in range(len(annotations[annotator_ids[0]]["tokens"]))
    ]

    for user1, user2 in combinations(annotator_ids, 2):
        token_similarities = [
            token_similarity(
                annotations[user1]["tokens"][i], annotations[user2]["tokens"][i]
            )
            for i in range(len(annotations[user1]["tokens"]))
        ]
        for i, score in enumerate(token_similarities):
            token_level_scores[i].append(score)

        average_similarity = sum(token_similarities) / len(token_similarities)
        pairwise_scores.append(average_similarity)

    # Calculate average IAA per token
    token_averages = [average(scores) for scores in token_level_scores]

    combinations_list = list(combinations(annotator_ids, 2))
    return pairwise_scores, combinations_list, token_averages


def get_document_level_iaa(annotations: dict) -> Tuple[list, list, list]:
    """Calculate document-level IAA scores."""

    annotator_ids = list(annotations.keys())
    logger.info(f"annotator_ids: {annotator_ids}")

    if len(annotator_ids) < 2:
        # Not enough annotators to calculate IAA
        # return 100% agreement
        return (
            [100],
            [],
            [100 for _ in range(len(annotations[annotator_ids[0]]["tokens"]))],
        )
    else:
        logger.info(f"annotator_ids: {annotator_ids}")

        # Calculate pairwise similarity
        pairwise_scores, combinations, token_aves = compute_pairwise_similarity(
            annotations
        )
        logger.info(f"pairwise_scores: {pairwise_scores}")

        return pairwise_scores, combinations, token_aves


def compile_tokens(annotations, input_tokens):
    """
    Compiles tokens from annotations, comparing them against the original text tokens to determine if changes were made.

    Args:
        annotations (dict): A dictionary containing annotator IDs as keys and their corresponding tokens as values.
        input_tokens (list): The original list of tokens for comparison.

    Returns:
        list: A list of dictionaries, each containing the compiled token and a flag indicating if it was changed or unchanged.
    """
    # Assuming all annotators have the same number of tokens as the input
    token_positions = len(input_tokens)
    compiled_tokens = []

    for i in range(token_positions):
        token_counts = {}

        # Gather tokens at this position from all annotators and count occurrences
        for annotator in annotations.values():
            token = annotator["tokens"][i]  # Assuming case sensitivity is important
            if token in token_counts:
                token_counts[token] += 1
            else:
                token_counts[token] = 1

        # Find the token with the highest count (most frequent token)
        compiled_token = max(token_counts, key=token_counts.get)

        # Determine if the compiled token matches the original token
        is_changed = compiled_token != input_tokens[i]

        compiled_tokens.append({"value": compiled_token, "changed": is_changed})

    return compiled_tokens


@router.get("/{project_id}/adjudication")
async def get_adjudication_endpoint(
    project_id: str,
    skip: int = Query(default=0, ge=0),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Get adjudication data for a project."""
    project_id = ObjectId(project_id)
    user_id = ObjectId(user.id)

    logger.info(f"skip: {skip}")

    project = await get_project(db, project_id, user_id)

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    logger.info(f"project flags: {project.flags}")
    logger.info(f"project tags: {project.tags}")

    flag_id_to_name = {f.id: f.name for f in project.flags}
    tag_id_to_name = {t.id: t.name for t in project.tags}

    logger.info(f"flag_id_to_name: {flag_id_to_name}")
    logger.info(f"tag_id_to_name: {tag_id_to_name}")

    logger.info(project)

    annotators = project.annotators

    total_texts = await db.texts.count_documents({"project_id": project_id})
    logger.info(f"total_texts: {total_texts}")

    texts_with_annotations = await get_texts_with_user_annotations(
        db=db,
        project_id=project_id,
        annotators=annotators,
        tag_id_to_name=tag_id_to_name,
        flag_id_to_name=flag_id_to_name,
        skip=skip,
    )

    logger.info(f"texts_with_annotations: {texts_with_annotations}")

    # Create adjudication data
    adjudication_data = []
    for text in texts_with_annotations:
        transformed = {
            "_id": text["id"],
            "input": text["source_tokens"],
            "annotations": defaultdict(dict),
        }

        # Iterate through the users in the replacements to structure the annotations
        for user, replacements in text["replacements"].items():
            transformed["annotations"][user] = {
                "tags": text["tags"][user],
                "tokens": replacements,
                "flags": text["flags"][user],
            }

        iaa_score, pairwise_scores, token_averages = get_document_level_iaa(
            transformed["annotations"]
        )

        compiled_tokens = compile_tokens(
            annotations=transformed["annotations"], input_tokens=transformed["input"]
        )

        transformed["compiled"] = {"tokens": compiled_tokens}
        transformed["scores"] = {
            "doc": iaa_score,
            "pairwise": pairwise_scores,
            "tokens": token_averages,
        }

        adjudication_data.append(transformed)

    # return {
    #     "texts_with_annotations": texts_with_annotations,
    #     "adjudication_data": adjudication_data,
    # }
    return {"data": adjudication_data[0], "count": total_texts}


@router.patch("/{project_id}/tags/{tag_id}")
async def update_project_tags_endpoint(
    project_id: str,
    tag_id: str,
    tag: Tag,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Update a projec tag."""

    project = ObjectId(project_id)
    tag_id = ObjectId(tag_id)

    project = await get_project(db, project, ObjectId(user.id))

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    db_tag = await db.resources.find_one({"_id": tag_id})

    if db_tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
        )

    logger.info(tag)

    updated_tag = await db.resources.update_one(
        {"_id": tag_id},
        {"$set": tag.model_dump(by_alias=True, exclude_none=True)},
    )

    if updated_tag.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_304_NOT_MODIFIED,
            detail="Tag update failed or data was identical",
        )

    updated_tag = await db.resources.find_one({"_id": tag_id})

    return ResourceOut(**updated_tag)


@router.delete("/{project_id}/tags/{tag_id}")
async def delete_project_tags_endpoint(
    project_id: str,
    tag_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Delete a project tag."""

    project_id = ObjectId(project_id)
    tag_id = ObjectId(tag_id)

    project = await get_project(db, project_id, ObjectId(user.id))

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    tag = await db.resources.find_one({"_id": tag_id})
    if tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
        )

    # Check if tag is in use
    tag_in_use = await db.annotations.count_documents({"value": tag_id})
    if tag_in_use > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag is in use and cannot be deleted",
        )

    await db.resources.delete_one({"_id": tag_id})

    return ResourceOut(**tag)


@router.post("/{project_id}/flags")
async def add_project_flags_endpoint(
    project_id: str,
    flag: Flag,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Add a flag to a project."""
    project_id = ObjectId(project_id)

    project = await get_project(db, project_id, ObjectId(user.id))

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    flags = project.flags
    logger.info(f"project flags: {flags}")
    # Check if flag already exists in flags by name
    flag_names = [f.name for f in flags]
    valid_flag = flag.name not in flag_names

    if not valid_flag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Flag already exists on project",
        )

    inserted_flag = await db.resources.insert_one(
        ResourceDocumentModel(
            **flag.model_dump(by_alias=True),
            values=[],
            created_by=ObjectId(user.id),
            type="flag",
            project_id=project_id,
        ).model_dump(by_alias=True, exclude={"id"})
    )

    new_flag = await db.resources.find_one({"_id": ObjectId(inserted_flag.inserted_id)})

    return ResourceOut(**new_flag)


class FlagUpdate(BaseModel):
    name: str = Field(..., description="Name of the flag", min_length=1, max_length=50)


@router.patch("/{project_id}/flags/{flag_id}")
async def update_project_flags_endpoint(
    project_id: str,
    flag_id: str,
    body: FlagUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Update a project flag."""

    project_id = ObjectId(project_id)
    flag_id = ObjectId(flag_id)

    project = await get_project(db, project_id, ObjectId(user.id))
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    flag = await db.resources.find_one({"_id": flag_id})
    if flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flag not found"
        )

    flags = project.flags
    # Check if flag already exists in flags by name
    flag_names = [f.name for f in flags]
    valid_flag = body.name not in flag_names

    if not valid_flag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Flag already exists on project",
        )

    updated_flag = await db.resources.update_one(
        {"_id": flag_id},
        {"$set": body.model_dump()},
    )

    if updated_flag.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_304_NOT_MODIFIED,
            detail="Flag update failed or data was identical",
        )

    updated_flag = await db.resources.find_one({"_id": flag_id})

    return ResourceOut(**updated_flag)


@router.delete("/{project_id}/flags/{flag_id}")
async def delete_project_flags_endpoint(
    project_id: str,
    flag_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
):
    """Delete a project flag."""

    project_id = ObjectId(project_id)
    flag_id = ObjectId(flag_id)

    project = await get_project(db, project_id, ObjectId(user.id))

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    flag = await db.resources.find_one({"_id": flag_id})
    if flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flag not found"
        )

    # Check if flag is in use
    flag_in_use = await db.annotations.count_documents({"value": flag_id})
    if flag_in_use > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Flag is in use and cannot be deleted",
        )

    await db.resources.delete_one({"_id": flag_id})

    return ResourceOut(**flag)


async def download_project(
    project_id: ObjectId, user_id: ObjectId, db: AsyncIOMotorDatabase
):
    """Download a project"""
    project = await get_project(db, project_id, ObjectId(user_id))

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    texts = await db.texts.find({"project_id": project_id}).to_list(length=None)
    logger.info(f"Found: {len(texts)} texts")

    flag_id_to_name = {f.id: f.name for f in project.flags}
    tag_id_to_name = {t.id: t.name for t in project.tags}

    texts_with_annotations = await get_texts_with_user_annotations(
        db=db,
        project_id=project_id,
        annotators=project.annotators,
        tag_id_to_name=tag_id_to_name,
        flag_id_to_name=flag_id_to_name,
        limit=-1,
    )

    logger.info(f"texts_with_annotations: {len(texts_with_annotations)}")

    # Create adjudication data
    adjudication_data = []
    for text in texts_with_annotations:
        transformed = {
            "_id": text["id"],
            "input": text["source_tokens"],
            "annotations": defaultdict(dict),
        }

        # Iterate through the users in the replacements to structure the annotations
        for user, replacements in text["replacements"].items():
            transformed["annotations"][user] = {
                "tags": text["tags"][user],
                "tokens": replacements,
                "flags": text["flags"][user],
            }

        iaa_score, pairwise_scores, token_averages = get_document_level_iaa(
            transformed["annotations"]
        )

        compiled_tokens = compile_tokens(
            annotations=transformed["annotations"], input_tokens=transformed["input"]
        )

        transformed["compiled"] = {"tokens": compiled_tokens}
        transformed["scores"] = {
            "doc": iaa_score,
            "pairwise": pairwise_scores,
            "tokens": token_averages,
        }

        adjudication_data.append(transformed)

    return {
        "metadata": {
            **project.model_dump(by_alias=True),
            "annotators": project.annotators,
            "total_texts": len(texts),
        },
        "annotations": texts_with_annotations,
    }


async def download_replacements(
    db: AsyncIOMotorDatabase, project_id: ObjectId, user_id: ObjectId
) -> Dict[str, List[Dict[str, Any]]]:
    """Download replacements for a project"""
    annotations = await db.annotations.find(
        {
            "project_id": project_id,
            "type": "replacement",
            "suggestion": False,
        }
    ).to_list(length=None)

    logger.info(f"Found: {len(annotations)} replacements")

    token_replacement_counts: DefaultDict = defaultdict(dict)
    for a in annotations:
        token_id = str(a["token_id"])

        if token_id not in token_replacement_counts:
            token_replacement_counts[token_id] = {"value": a["value"], "count": 1}
        else:
            token_replacement_counts[token_id]["count"] += 1

    logger.info(f"token_replacement_counts: {token_replacement_counts}")

    annotated_text_ids = [ObjectId(a["text_id"]) for a in annotations]

    texts = await db.texts.find({"_id": {"$in": annotated_text_ids}}).to_list(
        length=None
    )

    replacements = defaultdict(list)
    token_replacement_ids = list(token_replacement_counts.keys())

    for text in texts:
        for token in text["tokens"]:
            token_id = str(token["_id"])
            if token_id in token_replacement_ids:
                token_value = token["value"]
                token_replacement = token_replacement_counts[token_id]
                if token_value not in replacements:
                    replacements[token_value] = [token_replacement]
                else:
                    # Flag to check if replacement was found
                    found = False
                    for r in replacements[token_value]:
                        if r["value"] == token_replacement["value"]:
                            r["count"] += token_replacement["count"]
                            found = True
                            break
                    if not found:
                        replacements[token_value].append(token_replacement)
    return replacements


@router.get("/download/{project_id}")
async def project_download_endpoint(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserDocumentModel = Depends(get_user),
    type: Literal["project", "replacements"] = Query(
        ..., description="Type of download"
    ),
):
    """Download a project"""

    if type == "project":
        return await download_project(
            project_id=ObjectId(project_id), user_id=ObjectId(user.id), db=db
        )
    elif type == "replacements":
        return await download_replacements(
            db=db, project_id=ObjectId(project_id), user_id=ObjectId(user.id)
        )
