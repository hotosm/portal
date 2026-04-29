"""Pydantic schemas for the Plans feature."""

from datetime import datetime
from typing import Literal

import nh3
from pydantic import BaseModel, ConfigDict, Field, field_validator

AppLiteral = Literal[
    "drone-tasking-manager",
    "export-tool",
    "fair",
    "field-tm",
    "open-aerial-map",
    "tasking-manager",
    "umap",
]


HydrationError = Literal["not_found", "upstream_unavailable"]

_ALLOWED_TAGS = frozenset(
    {"p", "h3", "h4", "h5", "strong", "em", "u", "ul", "ol", "li", "br", "a"}
)
_ALLOWED_ATTRS: dict[str, set[str]] = {"a": {"href"}}
_DESC_MAX_LEN = 10_000


def _sanitize_html(v: str | None) -> str | None:
    if not v:
        return v
    return nh3.clean(v, tags=_ALLOWED_TAGS, attributes=_ALLOWED_ATTRS)


class PlanImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    url: str
    display_order: int
    created_at: datetime


class PlanProjectItem(BaseModel):
    app: AppLiteral
    project_id: str
    data: dict | None = None


class PlanCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: str | None = Field(default=None, max_length=_DESC_MAX_LEN)
    is_public: bool = False
    projects: list[PlanProjectItem] = []

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v: str | None) -> str | None:
        return _sanitize_html(v)


class PlanUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    description: str | None = Field(default=None, max_length=_DESC_MAX_LEN)
    is_public: bool | None = None
    projects: list[PlanProjectItem] | None = None

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v: str | None) -> str | None:
        return _sanitize_html(v)


class PlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None
    is_public: bool
    projects: list[PlanProjectItem]
    images: list[PlanImageRead] = []
    created_at: datetime
    updated_at: datetime


class HydratedProjectItem(BaseModel):
    app: AppLiteral
    project_id: str
    data: dict | None = None
    upstream: dict | None = None
    error: HydrationError | None = None


class PlanReadHydrated(BaseModel):
    id: str
    name: str
    description: str | None
    is_public: bool
    projects: list[HydratedProjectItem]
    images: list[PlanImageRead] = []
    created_at: datetime
    updated_at: datetime


class PlanTag(BaseModel):
    id: str
    name: str
