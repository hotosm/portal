# portal/backend/app/models/homepage_map.py

from pydantic import BaseModel
from typing import List, Optional, Any


class UnifiedGeometry(BaseModel):
    """GeoJSON geometry for map features"""
    type: str = "Point"
    coordinates: List[float] = []


class TaskingManagerMapItem(BaseModel):
    """Normalized item from Tasking Manager for map display"""
    id: int
    source: str = "tasking-manager"
    name: Optional[str] = None
    description: Optional[str] = None
    geometry: Optional[UnifiedGeometry] = None
    organisation: Optional[str] = None
    percent_mapped: Optional[float] = None
    percent_validated: Optional[float] = None
    created: Optional[str] = None


class OpenAerialMapItem(BaseModel):
    """Normalized item from Open Aerial Map for map display"""
    id: str
    source: str = "open-aerial-map"
    name: Optional[str] = None
    description: Optional[str] = None
    geometry: Optional[UnifiedGeometry] = None
    bbox: Optional[List[float]] = None
    provider: Optional[str] = None
    gsd: Optional[float] = None
    acquisition_start: Optional[str] = None
    acquisition_end: Optional[str] = None
    thumbnail: Optional[str] = None


class DroneTMMapItem(BaseModel):
    """Normalized item from Drone Tasking Manager for map display"""
    id: str
    source: str = "drone-tasking-manager"
    name: Optional[str] = None
    description: Optional[str] = None
    geometry: Optional[UnifiedGeometry] = None
    slug: Optional[str] = None
    status: Optional[str] = None
    total_task_count: Optional[int] = None
    ongoing_task_count: Optional[int] = None
    completed_task_count: Optional[int] = None


class FAIRMapItem(BaseModel):
    """Normalized item from fAIr for map display"""
    id: int
    source: str = "fair"
    name: Optional[str] = None
    description: Optional[str] = None
    geometry: Optional[UnifiedGeometry] = None
    accuracy: Optional[float] = None
    status: Optional[int] = None
    base_model: Optional[str] = None
    thumbnail_url: Optional[str] = None
    username: Optional[str] = None
    created_at: Optional[str] = None


class UnifiedMapItem(BaseModel):
    """Generic unified map item that can represent any source"""
    id: Any  # Can be int or str depending on source
    source: str
    name: Optional[str] = None
    description: Optional[str] = None
    geometry: Optional[UnifiedGeometry] = None
    metadata: Optional[dict] = None  # Source-specific additional data


class SourceStatus(BaseModel):
    """Status of a data source fetch"""
    success: bool = True
    count: int = 0
    error: Optional[str] = None


class UnifiedMapResponse(BaseModel):
    """Response model for unified homepage map endpoint"""
    tasking_manager: List[TaskingManagerMapItem] = []
    open_aerial_map: List[OpenAerialMapItem] = []
    drone_tasking_manager: List[DroneTMMapItem] = []
    fair: List[FAIRMapItem] = []
    sources_status: dict[str, SourceStatus] = {}
    total_count: int = 0