import logging
import re
from typing import Any, Optional, List, Dict

from bson import ObjectId
from fastapi import HTTPException, status
from lexiclean.config import get_config

logger = logging.getLogger(__name__)


class UnauthorizedException(HTTPException):
    def __init__(self, detail: str, **kwargs):
        """Returns HTTP 403"""
        super().__init__(status.HTTP_403_FORBIDDEN, detail=detail)


class UnauthenticatedException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Requires authentication"
        )


def text_token_search_pipeline(
    project_id: ObjectId,
    search_value: Optional[str] = None,
    exclude_token_ids: List[ObjectId] = [],
) -> List[Dict[str, Any]]:

    match_stage = {"project_id": project_id}

    filter_conditions = []

    if search_value:
        filter_conditions.append(
            {
                "$regexMatch": {
                    "input": "$$token.value",
                    "regex": re.compile(r"\b" + re.escape(search_value) + r"\b"),
                }
            }
        )

    if exclude_token_ids:
        filter_conditions.append({"$not": {"$in": ["$$token._id", exclude_token_ids]}})

    pipeline = [
        {"$match": match_stage},
        {
            "$project": {
                "tokens": {
                    "$filter": {
                        "input": "$tokens",
                        "as": "token",
                        "cond": {"$and": filter_conditions},
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

    logger.info(f"Text token search pipeline: {pipeline}")

    return pipeline

    # return [
    #     {
    #         "$match": {"project_id": project_id},
    #     },
    #     {
    #         "$project": {
    #             "tokens": {
    #                 "$filter": {
    #                     "input": "$tokens",
    #                     "as": "token",
    #                     "cond": {
    #                         "$and": [
    #                             (
    #                                 {
    #                                     "$regexMatch": {
    #                                         "input": "$$token.value",
    #                                         "regex": re.compile(
    #                                             r"\b" + re.escape(search_value) + r"\b"
    #                                         ),
    #                                     }
    #                                 }
    #                                 if search_value
    #                                 else {}
    #                             ),
    #                             {"$not": [{"$in": ["$$token._id", exclude_token_ids]}]},
    #                         ]
    #                     },
    #                 }
    #             },
    #             "_id": 1,
    #         }
    #     },
    #     {"$unwind": "$tokens"},
    #     {"$addFields": {"tokens.text_Id": "$_id"}},
    #     {"$replaceRoot": {"newRoot": "$tokens"}},
    #     {"$addFields": {"token_id": "$_id"}},
    #     {"$project": {"_id": 0}},
    # ]
