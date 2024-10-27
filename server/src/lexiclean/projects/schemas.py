"""Project schemas."""

from datetime import datetime
from typing import Annotated, Any, Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.functional_validators import AfterValidator, BeforeValidator
from src.notifications.schemas import NOTIFICATION_STATUS
from src.resources.schemas import ResourceOut
from typing_extensions import Self

AnnotatedObjectId = Annotated[ObjectId | str, BeforeValidator(lambda x: str(x))]
AfterAnnotatedObjectId = Annotated[
    ObjectId | str, AfterValidator(lambda x: ObjectId(x))
]

Corpus_Types = Literal["standard", "identifiers", "parallel"]


class BaseDocument(BaseModel):
    id: ObjectId | None = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: ObjectId = Field(...)

    model_config = ConfigDict(arbitrary_types_allowed=True)


class CorpusPreprocessing(BaseModel):
    lowercase: bool = Field(default=False)
    remove_punctuation: bool = Field(default=False)
    remove_duplicates: bool = Field(default=False)
    remove_content: list[str] = Field(
        default=[],
        examples=[["l/h", "bkt", "als"]],
        description="Word or phrases to remove from corpus",
    )


class CorpusDetails(BaseModel):
    type: Corpus_Types = Field(default="standard", description="Type of corpus")
    filename: str | None = Field(default=None, description="Filename of the corpus")


class ReplacementDetails(BaseModel):
    values: dict[str, str] = Field(
        default={}, description="Dictionary of token replacements"
    )
    filename: str | None = Field(
        default=None, description="Filename of the replacement file"
    )


class PreannotationSettings(BaseModel):
    replacements: bool = Field(default=False)
    tags: bool = Field(default=False)
    suggested: bool = Field(default=True)


class Settings(BaseModel):
    special_tokens: list[str] = Field(
        default=[], examples=[["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"]]
    )
    digits_in_vocab: bool = Field(default=False)
    preprocessing: CorpusPreprocessing = Field(default=CorpusPreprocessing())
    ranking: bool = Field(
        default=True, description="Perform inverse tf-idf ranking of tokens"
    )
    preannotation: PreannotationSettings = Field(default=PreannotationSettings())


class Flag(BaseModel):
    name: str = Field(..., min_length=1, max_length=32)


class Tag(BaseModel):
    name: str = Field(..., min_length=1, max_length=32)
    color: str = Field(
        default="#4DB6AC",
        min_length=3,
        max_length=7,
        pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
        description="Hex color code",
        examples=["#4DB6AC"],
    )
    description: str | None = Field(default=None, max_length=512)
    values: list[str] = Field(default=[])


class Metrics(BaseModel):
    initial_vocab_size: int = Field(default=0)
    initial_candidate_vocab_size: int = Field(default=0)
    initial_token_count: int = Field(default=0)


class Annotator(BaseModel):
    id: ObjectId = Field(alias="_id")
    status: NOTIFICATION_STATUS

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class ProjectDocumentModel(BaseDocument):
    name: str = Field(..., min_length=1, max_length=128)
    description: str = Field(default="", max_length=512)
    corpus: CorpusDetails = Field(default=CorpusDetails())
    replacements: ReplacementDetails = Field(default=ReplacementDetails())
    settings: Settings = Field(default=Settings())
    # resources: list[ObjectId] = Field(default=[])
    annotators: list[Annotator] = Field(default=[])
    flags: list[Flag] = Field(default=[])
    tags: list[ObjectId] = Field(default=[])
    metrics: Metrics = Field(default=Metrics())

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    description: str = Field(default="", max_length=512)
    corpus: CorpusDetails
    replacements: ReplacementDetails = Field(default=ReplacementDetails())
    settings: Settings = Field(default=Settings())
    flags: list[Flag] = Field(default=[])
    tags: list[Tag] = Field(default=[])
    # resources: list[AfterAnnotatedObjectId] = Field(default=[])
    annotators: list[str] = Field(default=[])
    texts: dict[str, str] = Field(default={})

    @model_validator(mode="before")
    @classmethod
    def check_texts_exist(cls, data: Any) -> Any:
        if len(data["texts"].items()) == 0:
            raise ValueError("At least one text is required")
        return data

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=32)
    description: str | None = Field(default=None, max_length=512)


class UserOut(BaseModel):
    id: AnnotatedObjectId = Field(alias="_id")
    username: str
    is_admin: bool = Field(default=False)

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class AnnotatorOut(BaseModel):
    id: AnnotatedObjectId = Field(alias="_id")
    status: NOTIFICATION_STATUS

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class ProjectOut(ProjectDocumentModel):
    id: AnnotatedObjectId = Field(alias="_id")
    created_by: AnnotatedObjectId
    # resources: list[AnnotatedObjectId] | None
    annotators: list[AnnotatorOut]
    tags: list[AnnotatedObjectId]
    texts: int = Field(default=0)
    flags: list[AnnotatedObjectId]
    saved_texts: int = Field(default=0)

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class ProjectOutWithResources(ProjectOut):
    created_by: UserOut
    annotators: list[UserOut]
    tags: list[ResourceOut]
    flags: list[ResourceOut]
