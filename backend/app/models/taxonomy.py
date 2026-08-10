"""Pydantic schemas for Groups and Tags: open-text taxonomies on plan projects."""

from datetime import datetime
from typing import Literal

import nh3
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

# Duplicated from app.models.plan.GroupType (not imported) so that module can
# import GroupRead/TagRead from here without a circular import — this refers
# to the *login* team/organization type, same meaning as Plan.group_type.
GroupType = Literal["team", "organization"]

_ALLOWED_TAGS = frozenset({"p", "strong", "em", "u", "br"})
_DESC_MAX_LEN = 2_000
_NAME_MAX_LEN = 200


def _sanitize_html(v: str | None) -> str | None:
    if not v:
        return v
    return nh3.clean(v, tags=_ALLOWED_TAGS)


class ScopeMixin(BaseModel):
    """Ownership scope shared by Group and Tag create payloads.

    Mirrors Plan's group_type/group_id (see app/models/plan.py PlanScopeMixin):
    unset means personal (owned by the creator only); setting both shares the
    entity with every member of that login team/organization.
    """

    group_type: GroupType | None = None
    group_id: str | None = None

    @model_validator(mode="after")
    def check_scope(self) -> "ScopeMixin":
        if (self.group_type is None) != (self.group_id is None):
            raise ValueError("group_type and group_id must be set together")
        return self


class GroupCreate(ScopeMixin):
    name: str = Field(..., min_length=1, max_length=_NAME_MAX_LEN)
    description: str | None = Field(default=None, max_length=_DESC_MAX_LEN)

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v: str | None) -> str | None:
        return _sanitize_html(v)


class GroupUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=_NAME_MAX_LEN)
    description: str | None = Field(default=None, max_length=_DESC_MAX_LEN)

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v: str | None) -> str | None:
        return _sanitize_html(v)


class GroupRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None
    owner_id: str
    group_type: GroupType | None = None
    group_id: str | None = None
    created_at: datetime
    updated_at: datetime


class TagCreate(ScopeMixin):
    name: str = Field(..., min_length=1, max_length=_NAME_MAX_LEN)


class TagUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=_NAME_MAX_LEN)


class TagRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    owner_id: str
    group_type: GroupType | None = None
    group_id: str | None = None
    created_at: datetime
    updated_at: datetime


class GroupIdsUpdate(BaseModel):
    """Replace the full set of groups assigned to a plan project/task."""

    group_ids: list[str] = []


class TagIdsUpdate(BaseModel):
    """Replace the full set of tags assigned to a plan project/task."""

    tag_ids: list[str] = []
