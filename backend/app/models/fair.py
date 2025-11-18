# app/models/fair.py
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