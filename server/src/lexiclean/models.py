from datetime import datetime
from typing import Annotated

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field
from pydantic.functional_validators import AfterValidator, BeforeValidator

AnnotatedObjectId = Annotated[ObjectId | str, BeforeValidator(lambda x: str(x))]
AfterAnnotatedObjectId = Annotated[
    ObjectId | str, AfterValidator(lambda x: ObjectId(x))
]


class BaseDocument(BaseModel):
    id: ObjectId | None = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: ObjectId = Field(...)

    model_config = ConfigDict(arbitrary_types_allowed=True)
