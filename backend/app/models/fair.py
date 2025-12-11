# portal/backend/app/models/fair.py

from pydantic import BaseModel
from typing import List, Optional


class User(BaseModel):
    osm_id: Optional[int] = None
    username: Optional[str] = None


class FAIRModel(BaseModel):
    id: Optional[int] = None
    user: Optional[User] = None
    accuracy: Optional[float] = None
    thumbnail_url: Optional[str] = None
    name: Optional[str] = None
    created_at: Optional[str] = None
    last_modified: Optional[str] = None
    description: Optional[str] = None
    published_training: Optional[int] = None
    status: Optional[int] = None
    base_model: Optional[str] = None
    dataset: Optional[int] = None


class FAIRProjectsResponse(BaseModel):
    """Response model for GET /projects (list of AI models)"""
    count: Optional[int] = None
    next: Optional[str] = None
    previous: Optional[str] = None
    results: List[FAIRModel] = []


class FAIRCentroidProperties(BaseModel):
    """Properties for a model centroid feature"""
    mid: int


class FAIRCentroidGeometry(BaseModel):
    """Geometry for a model centroid (Point)"""
    type: str = "Point"
    coordinates: List[float]


class FAIRCentroidFeature(BaseModel):
    """A single centroid feature in GeoJSON format"""
    type: str = "Feature"
    geometry: FAIRCentroidGeometry
    properties: FAIRCentroidProperties


class FAIRCentroidsResponse(BaseModel):
    """Response model for GET /models/centroid (GeoJSON FeatureCollection)"""
    type: str = "FeatureCollection"
    features: List[FAIRCentroidFeature] = []


class FAIRDataset(BaseModel):
    """Dataset information associated with a model"""
    id: Optional[int] = None
    name: Optional[str] = None
    source_imagery: Optional[str] = None


class FAIRModelDetail(BaseModel):
    """Detailed model information from GET /model/{mid}"""
    id: int
    name: Optional[str] = None
    description: Optional[str] = None
    accuracy: Optional[float] = None
    status: Optional[int] = None
    base_model: Optional[str] = None
    published_training: Optional[int] = None
    user: Optional[User] = None
    dataset: Optional[FAIRDataset] = None
    created_at: Optional[str] = None
    last_modified: Optional[str] = None
    thumbnail_url: Optional[str] = None