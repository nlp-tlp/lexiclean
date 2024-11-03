"""Project router services."""

import logging
import math
from typing import Any, Dict, List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import UpdateOne

from lexiclean.projects.schemas import ProjectOutWithResources

logger = logging.getLogger(__name__)


def calculate_tfidf(texts):
    """
    Calculate TF-IDF scores for each token in the texts.

    :param texts: List of text objects [{'original': 'text content'}]
    :return: Dictionary of token TF-IDF scores
    """
    counts = {}
    keys = []

    for i, text_obj in enumerate(texts):
        text = text_obj["original"].split()

        for token in text:
            if token not in counts:
                counts[token] = {
                    "tf": 1,
                    "df": [i],  # used to capture index of texts term appears in
                }
                keys.append(token)
            else:
                counts[token]["tf"] += 1
                if i not in counts[token]["df"]:
                    counts[token]["df"].append(i)

    # Aggregate doc counts into df e.g. {key: {tf: #, df #}}
    for key in counts.keys():
        counts[key]["df"] = len(counts[key]["df"])

    # Compute tf-idf scores for each token
    tfidfs = {
        key: (
            (counts[key]["tf"] * math.log10(len(texts) / counts[key]["df"]))
            if counts[key]["tf"] != 0 and (len(texts) / counts[key]["df"]) != 0
            else 0
        )
        for key in counts.keys()
    }

    return tfidfs


async def rank_texts(
    db: AsyncIOMotorDatabase,
    texts: List[Dict[str, Any]],
    candidate_tokens: List[Dict[str, Any]],
):
    """
    Calculate mean, masked, TF-IDF for each text
    """
    # Compute average document tf-idf1
    # - 1. get set of candidate tokens (derived up-stream)
    # - 2. filter texts for only candidate tokens
    # - 3. compute filtered text average tf-idf score/weight
    tfidfs = calculate_tfidf(texts)  # Token tf-idfs

    logger.info("calculated inverse TF-IDF scores")
    logger.info(f"tfidfs: {tfidfs}")

    candidate_tokens_unique = set(candidate_tokens)
    logger.info(f"candidate_tokens_unique: {candidate_tokens_unique}")

    # Calculate mean, weighted, tf-idfs scores
    for text in texts:
        token_weights = [
            tfidfs[token["value"]]
            for token in text["tokens"]
            if token["value"] in candidate_tokens_unique
        ]

        text_weight = sum(token_weights) if token_weights else -1

        text["weight"] = text_weight

    # Rank texts by their weight
    texts.sort(key=lambda x: x["weight"], reverse=True)
    for index, text in enumerate(texts):
        text["rank"] = index

    # Add weight and rank to text objects
    weighted_text_update_objs = [
        UpdateOne(
            filter={"_id": text["_id"]},
            update={"$set": {"weight": text["weight"], "rank": text["rank"]}},
            upsert=True,
        )
        for text in texts
    ]

    await db.texts.bulk_write(weighted_text_update_objs)
    logger.info("weighted and ranked texts")


async def get_project(
    db: AsyncIOMotorDatabase, project_id: ObjectId, user_id: ObjectId
) -> Optional[ProjectOutWithResources]:
    pipeline: List[Dict[str, Any]] = [
        {
            "$match": {
                "_id": project_id,
                "$or": [
                    {"created_by": user_id},
                    {"annotators._id": user_id},
                ],
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "created_by",
                "foreignField": "_id",
                "as": "created_by",
            }
        },
        {"$unwind": "$created_by"},
        {
            "$addFields": {"created_by.is_admin": True}
        },  # TODO: check if user is admin after aggregation.
        {
            "$addFields": {
                "annotators": {
                    "$filter": {
                        "input": "$annotators",
                        "as": "annotator",
                        "cond": {"$eq": ["$$annotator.status", "accepted"]},
                    }
                }
            }
        },  # Filter out pending or rejected annotators
        {
            "$lookup": {
                "from": "users",
                "localField": "annotators._id",
                "foreignField": "_id",
                "as": "annotators",
            }
        },
        {
            "$lookup": {
                "from": "resources",
                "localField": "_id",
                "foreignField": "project_id",
                "as": "resources",
            }
        },
        {"$project": {"tags": 0, "flags": 0}},
    ]

    project = await db.projects.aggregate(pipeline).to_list(length=None)

    if project is None or len(project) == 0:
        return None
    project = project[0]

    project["annotators"] = [
        {**a, "is_admin": str(a["_id"]) == str(user_id)} for a in project["annotators"]
    ]

    resources = project.pop("resources")
    tags = [r for r in resources if r["type"] == "tag"]
    flags = [r for r in resources if r["type"] == "flag"]

    return ProjectOutWithResources(**project, tags=tags, flags=flags)
