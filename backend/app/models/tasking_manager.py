# portal/backend/app/models/tasking_manager.py

from pydantic import BaseModel
from typing import Any, List, Optional


class Pagination(BaseModel):
    hasNext: Optional[bool] = None
    hasPrev: Optional[bool] = None
    page: Optional[int] = None
    perPage: Optional[int] = None
    total: Optional[int] = None


class ProjectInfo(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class Project(BaseModel):
    projectId: Optional[int] = None
    name: Optional[str] = None
    organisationName: Optional[str] = None
    organisationSlug: Optional[str] = None
    projectInfo: Optional[ProjectInfo] = None
    projectInfoLocales: Optional[List[Any]] = None
    created: Optional[str] = None
    percentMapped: Optional[float] = None
    percentValidated: Optional[float] = None
    percentBadImagery: Optional[float] = None


class ProjectsResponse(BaseModel):
    mapResults: Optional[Any] = None
    results: List[Project] = []
    pagination: Optional[Pagination] = None


class CountriesResponse(BaseModel):
    """Response model for /countries endpoint"""
    tags: List[str] = []