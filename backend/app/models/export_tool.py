# portal/backend/app/models/export_tool.py

from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime


class ExportJobUser(BaseModel):
    """User information for export job"""
    username: str


class GeoJSONGeometry(BaseModel):
    """GeoJSON geometry"""
    type: str
    coordinates: Any


class ExportJob(BaseModel):
    """Individual export job from HOT Export Tool API"""
    model_config = ConfigDict(extra="allow")

    id: int
    uid: str
    user: Optional[ExportJobUser] = None
    name: str
    description: Optional[str] = None
    event: Optional[str] = None
    export_formats: Optional[List[str]] = None
    published: Optional[bool] = False
    feature_selection: Optional[str] = None
    buffer_aoi: Optional[bool] = False
    osma_link: Optional[str] = None
    created_at: datetime
    area: Optional[float] = None
    simplified_geom: Optional[GeoJSONGeometry] = None
    mbtiles_source: Optional[str] = None
    mbtiles_minzoom: Optional[int] = None
    mbtiles_maxzoom: Optional[int] = None
    pinned: Optional[bool] = False
    unfiltered: Optional[bool] = False
    userinfo: Optional[bool] = False


class ExportJobsResponse(BaseModel):
    """Response model for export jobs list"""
    count: int
    next: Optional[str] = None
    previous: Optional[str] = None
    results: List[ExportJob]