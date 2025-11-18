# app/models/open_aerial_map.py
from pydantic import BaseModel
from typing import List, Optional, Any


class Meta(BaseModel):
    provided_by: Optional[str] = None
    license: Optional[str] = None
    website: Optional[str] = None
    page: Optional[int] = None
    limit: Optional[int] = None
    found: Optional[int] = None


class Properties(BaseModel):
    wmts: Optional[str] = None
    tms: Optional[str] = None
    thumbnail: Optional[str] = None
    sensor: Optional[str] = None


class GeoJSON(BaseModel):
    bbox: Optional[List[float]] = None
    coordinates: Optional[List[List[List[float]]]] = None
    type: Optional[str] = None


class ImageryResult(BaseModel):
    _id: Optional[str] = None
    uuid: Optional[str] = None
    __v: Optional[int] = None
    title: Optional[str] = None
    projection: Optional[str] = None
    bbox: Optional[List[float]] = None
    footprint: Optional[str] = None
    gsd: Optional[float] = None
    file_size: Optional[int] = None
    acquisition_start: Optional[str] = None
    acquisition_end: Optional[str] = None
    platform: Optional[str] = None
    provider: Optional[str] = None
    contact: Optional[str] = None
    properties: Optional[Properties] = None
    uploaded_at: Optional[str] = None
    meta_uri: Optional[str] = None
    geojson: Optional[GeoJSON] = None


class ImageryListResponse(BaseModel):
    """Response model for GET /projects (list of imagery)"""
    meta: Optional[Meta] = None
    results: List[ImageryResult] = []


class ImageryDetailResponse(BaseModel):
    """Response model for GET /projects/{image_id} (single imagery)"""
    meta: Optional[Meta] = None
    results: Optional[ImageryResult] = None