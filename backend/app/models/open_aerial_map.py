# app/models/open_aerial_map.py
from pydantic import BaseModel, Field
from typing import List, Optional


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
    id: Optional[str] = Field(None, alias="_id")
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

    model_config = {
        "populate_by_name": True
    }


class ImageryListResponse(BaseModel):
    meta: Optional[Meta] = None
    results: List[ImageryResult] = []


class ImageryDetailResponse(BaseModel):
    meta: Optional[Meta] = None
    results: Optional[ImageryResult] = None
