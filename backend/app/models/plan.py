"""Pydantic schemas for the Plans feature."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


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


class PlanProjectItem(BaseModel):
    app: AppLiteral
    project_id: str
    data: Optional[dict] = None


class PlanCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    is_public: bool = False
    projects: list[PlanProjectItem] = []


class PlanUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    is_public: Optional[bool] = None
    projects: Optional[list[PlanProjectItem]] = None


class PlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str]
    is_public: bool
    projects: list[PlanProjectItem]
    created_at: datetime
    updated_at: datetime


class HydratedProjectItem(BaseModel):
    app: AppLiteral
    project_id: str
    data: Optional[dict] = None
    upstream: Optional[dict] = None
    error: Optional[HydrationError] = None


class PlanReadHydrated(BaseModel):
    id: str
    name: str
    description: Optional[str]
    is_public: bool
    projects: list[HydratedProjectItem]
    created_at: datetime
    updated_at: datetime


class PlanTag(BaseModel):
    id: str
    name: str
