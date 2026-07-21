"""Pydantic schemas for the Plans feature."""

from datetime import datetime
from typing import Literal

import nh3
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

AppLiteral = Literal[
    "chatmap",
    "drone-tasking-manager",
    "export-tool",
    "fair",
    "field-tm",
    "open-aerial-map",
    "tasking-manager",
    "umap",
]

StatusLiteral = Literal["pending", "in_progress", "done", "task"]

Visibility = Literal["private", "group", "public"]
EditScope = Literal["owner", "group"]
GroupType = Literal["team", "organization"]

HydrationError = Literal[
    "not_found", "upstream_unavailable", "upstream_timeout", "pending"
]

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
    id: str | None = None
    app: AppLiteral | None = None
    project_id: str | None = None
    project_exists: bool = True
    status: StatusLiteral = "in_progress"
    featured: bool = False
    data: dict | None = None

    @model_validator(mode="after")
    def check_project_fields(self) -> "PlanProjectItem":
        if self.project_exists:
            if self.app is None or self.project_id is None:
                raise ValueError("app and project_id are required when project_exists is True")
        else:
            if self.app is None:
                raise ValueError("app is required when project_exists is False")
            if self.project_id is not None:
                raise ValueError("project_id must be absent when project_exists is False")
        return self


class PlanScopeMixin(BaseModel):
    """Scope + visibility fields shared by create and update payloads."""

    # is_public kept for backward compatibility; mapped to visibility server-side.
    is_public: bool | None = None
    visibility: Visibility | None = None
    group_type: GroupType | None = None
    group_id: str | None = None
    edit_scope: EditScope | None = None

    @model_validator(mode="after")
    def check_scope(self) -> "PlanScopeMixin":
        # A personal plan (no group) can only be private or public, owner-edited.
        if self.group_type is None and self.group_id is None:
            if self.visibility == "group":
                raise ValueError("visibility 'group' requires a group")
            if self.edit_scope == "group":
                raise ValueError("edit_scope 'group' requires a group")
        if (self.group_type is None) != (self.group_id is None):
            raise ValueError("group_type and group_id must be set together")
        return self


class PlanCreate(PlanScopeMixin):
    name: str = Field(..., min_length=1)
    description: str | None = Field(default=None, max_length=_DESC_MAX_LEN)
    projects: list[PlanProjectItem] = []

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v: str | None) -> str | None:
        return _sanitize_html(v)


class PlanUpdate(PlanScopeMixin):
    name: str | None = Field(default=None, min_length=1)
    description: str | None = Field(default=None, max_length=_DESC_MAX_LEN)
    projects: list[PlanProjectItem] | None = None

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v: str | None) -> str | None:
        return _sanitize_html(v)


class PlanScopeRead(BaseModel):
    """Scope/visibility fields exposed on plan reads, plus per-viewer flags."""

    is_public: bool
    visibility: Visibility
    group_type: GroupType | None = None
    group_id: str | None = None
    edit_scope: EditScope
    owner_id: str
    is_owner: bool = False
    can_edit: bool = False


class PlanRead(PlanScopeRead):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None
    projects: list[PlanProjectItem]
    images: list[PlanImageRead] = []
    created_at: datetime
    updated_at: datetime


class HydratedProjectItem(BaseModel):
    id: str | None = None
    app: AppLiteral | None
    project_id: str | None
    project_exists: bool = True
    status: StatusLiteral = "in_progress"
    featured: bool = False
    data: dict | None = None
    upstream: dict | None = None
    error: HydrationError | None = None
    # True when this item was served from the stored snapshot (row.data) without a
    # live upstream call, so the frontend can show a subtle "updating…" state.
    from_snapshot: bool = False


class PlanReadHydrated(PlanScopeRead):
    id: str
    name: str
    description: str | None
    projects: list[HydratedProjectItem]
    images: list[PlanImageRead] = []
    created_at: datetime
    updated_at: datetime


class PlanTag(BaseModel):
    id: str
    name: str


class ProjectStatusUpdate(BaseModel):
    status: StatusLiteral


class UrlResolveRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048)


class UrlResolveResponse(BaseModel):
    app: AppLiteral
    project_id: str
    upstream: dict | None = None


class CompleteTaskRequest(BaseModel):
    url: str | None = Field(default=None, min_length=1, max_length=2048)
    app: AppLiteral | None = None
    project_id: str | None = None

    @model_validator(mode="after")
    def check_exactly_one_input(self) -> "CompleteTaskRequest":
        has_url = self.url is not None
        has_direct = self.app is not None and self.project_id is not None
        if not has_url and not has_direct:
            raise ValueError("Provide either url or app+project_id")
        if has_url and has_direct:
            raise ValueError("Provide url or app+project_id, not both")
        return self
