# portal/backend/app/models/field_tm.py

from pydantic import BaseModel
from typing import List, Optional


class Centroid(BaseModel):
    type: Optional[str] = None
    coordinates: Optional[List[float]] = None


class FMTMProjectSummary(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    organisation_id: Optional[int] = None
    priority: Optional[str] = None
    hashtags: Optional[List[str]] = None
    location_str: Optional[str] = None
    short_description: Optional[str] = None
    status: Optional[str] = None
    visibility: Optional[str] = None
    organisation_logo: Optional[str] = None
    centroid: Optional[Centroid] = None
    total_tasks: Optional[int] = None
    num_contributors: Optional[int] = None
    total_submissions: Optional[int] = None
    tasks_mapped: Optional[int] = None
    tasks_validated: Optional[int] = None
    tasks_bad: Optional[int] = None


class FMTMPagination(BaseModel):
    has_next: Optional[bool] = None
    has_prev: Optional[bool] = None
    next_num: Optional[int] = None
    page: Optional[int] = None
    pages: Optional[int] = None
    prev_num: Optional[int] = None
    per_page: Optional[int] = None
    total: Optional[int] = None


class FMTMProjects(BaseModel):
    results: List[FMTMProjectSummary] = []
    pagination: Optional[FMTMPagination] = None


class FMTMProjectsResponse(BaseModel):
    """Response model for GET /projects (list of project summaries)"""
    projects: Optional[FMTMProjects] = None