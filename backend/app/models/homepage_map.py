"""Pydantic models for unified homepage map data."""

from typing import Literal

from pydantic import BaseModel


class HomePageMapFeatureProperties(BaseModel):
    projectId: str
    name: str | None = None
    product: Literal[
        "tasking-manager",
        "drone-tasking-manager",
        "fair",
        "imagery",
        "umap",
    ]


class HomePageMapFeatureGeometry(BaseModel):
    type: Literal["Point"] = "Point"
    coordinates: tuple[float, float]


class HomePageMapFeature(BaseModel):
    type: Literal["Feature"] = "Feature"
    geometry: HomePageMapFeatureGeometry
    properties: HomePageMapFeatureProperties


class HomePageMapSnapshotResponse(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: list[HomePageMapFeature]
