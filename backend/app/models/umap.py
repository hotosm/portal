# app/models/umap.py
"""Pydantic models for uMap API responses."""

from pydantic import BaseModel, ConfigDict
from typing import Any, List, Optional, Union


class UMapOptions(BaseModel):
    """uMap configuration options for individual features."""
    model_config = ConfigDict(extra='allow')
    
    iconOpacity: Optional[float] = None
    showLabel: Optional[bool] = None
    color: Optional[str] = None
    iconUrl: Optional[str] = None
    popupShape: Optional[str] = None


class FeatureProperties(BaseModel):
    """Properties of a GeoJSON feature."""
    model_config = ConfigDict(extra='allow')
    
    description: Optional[str] = None
    name: Optional[str] = None
    _umap_options: Optional[UMapOptions] = None


class Geometry(BaseModel):
    """GeoJSON geometry object.
    
    Supports Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon.
    """
    type: str
    coordinates: Union[List[float], List[List[float]], List[List[List[float]]]]


class Feature(BaseModel):
    """GeoJSON feature object."""
    model_config = ConfigDict(extra='allow')
    
    type: str
    geometry: Geometry
    properties: FeatureProperties
    id: Optional[str] = None


class LayerUMapOptions(BaseModel):
    """uMap configuration options for the entire layer."""
    model_config = ConfigDict(extra='allow')
    
    displayOnLoad: Optional[bool] = None
    inCaption: Optional[bool] = None
    browsable: Optional[bool] = None
    editMode: Optional[str] = None
    id: Optional[str] = None
    name: Optional[str] = None
    rank: Optional[int] = None
    color: Optional[str] = None
    iconUrl: Optional[str] = None
    popupShape: Optional[str] = None
    remoteData: Optional[dict] = None
    popupContentTemplate: Optional[str] = None
    permissions: Optional[dict] = None


class UMapFeatureCollection(BaseModel):
    """GeoJSON FeatureCollection with uMap extensions.
    
    This is the main response model for the uMap API endpoint.
    """
    model_config = ConfigDict(extra='allow')
    
    type: str
    features: List[Feature]
    _umap_options: Optional[LayerUMapOptions] = None