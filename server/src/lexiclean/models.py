from datetime import datetime
from typing import Annotated, Optional, Union

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field
from pydantic.functional_validators import AfterValidator, BeforeValidator

AnnotatedObjectId = Annotated[Union[ObjectId, str], BeforeValidator(lambda x: str(x))]
AfterAnnotatedObjectId = Annotated[
    Union[ObjectId, str], AfterValidator(lambda x: ObjectId(x))
]


class BaseDocument(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: ObjectId = Field(...)

    model_config = ConfigDict(arbitrary_types_allowed=True)
