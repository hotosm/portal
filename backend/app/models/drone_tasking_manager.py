# portal/backend/app/models/drone_tasking_manager.py

from pydantic import BaseModel
from typing import List, Optional, Any


class Geometry(BaseModel):
    type: Optional[str] = None
    coordinates: Optional[List[List[List[float]]]] = None


class OutlineProperties(BaseModel):
    id: Optional[str] = None
    bbox: Optional[List[Optional[float]]] = None


class Outline(BaseModel):
    type: Optional[str] = None
    geometry: Optional[Geometry] = None
    properties: Optional[OutlineProperties] = None
    id: Optional[str] = None


class TaskOutline(BaseModel):
    type: Optional[str] = None
    geometry: Optional[Geometry] = None
    properties: Optional[OutlineProperties] = None
    id: Optional[str] = None


class Task(BaseModel):
    id: Optional[str] = None
    project_id: Optional[str] = None
    project_task_index: Optional[int] = None
    outline: Optional[TaskOutline] = None
    state: Optional[str] = None
    user_id: Optional[str] = None
    name: Optional[str] = None
    image_count: Optional[int] = None
    assets_url: Optional[str] = None
    total_area_sqkm: Optional[float] = None
    flight_time_minutes: Optional[float] = None
    flight_distance_km: Optional[float] = None
    total_image_uploaded: Optional[int] = None


class DroneTMProject(BaseModel):
    id: Optional[str] = None
    slug: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    per_task_instructions: Optional[str] = None
    requires_approval_from_manager_for_locking: Optional[bool] = None
    outline: Optional[Any] = None  # Can be Outline object or dict with "type" and "coordinates"
    no_fly_zones: Optional[Any] = None
    requires_approval_from_regulator: Optional[bool] = None
    regulator_emails: Optional[str] = None
    regulator_approval_status: Optional[str] = None
    image_processing_status: Optional[str] = None
    oam_upload_status: Optional[str] = None
    assets_url: Optional[str] = None
    orthophoto_url: Optional[str] = None
    regulator_comment: Optional[str] = None
    commenting_regulator_id: Optional[str] = None
    author_name: Optional[str] = None
    project_area: Optional[float] = None
    total_task_count: Optional[int] = None
    tasks: Optional[List[Task]] = []
    image_url: Optional[str] = None
    ongoing_task_count: Optional[int] = None
    completed_task_count: Optional[int] = None
    status: Optional[str] = None
    created_at: Optional[str] = None
    author_id: Optional[str] = None
    is_terrain_follow: Optional[bool] = None


class DroneTMPagination(BaseModel):
    has_next: Optional[bool] = None
    has_prev: Optional[bool] = None
    next_num: Optional[int] = None
    prev_num: Optional[int] = None
    page: Optional[int] = None
    per_page: Optional[int] = None
    total: Optional[int] = None


class DroneTMProjectsResponse(BaseModel):
    """Response model for GET /projects (list of projects)"""
    results: List[DroneTMProject] = []
    pagination: Optional[DroneTMPagination] = None