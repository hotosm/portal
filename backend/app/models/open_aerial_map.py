# portal/backend/app/models/open_aerial_map.py

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


# Compact models for snapshot storage (optimized for size)
class CompactProperties(BaseModel):
    """Minimal properties - only essential fields."""
    tms: Optional[str] = None
    thumbnail: Optional[str] = Field(None, alias="th")

    model_config = {"populate_by_name": True}


class CompactImagery(BaseModel):
    """
    Compact imagery model optimized for snapshot storage.
    Uses short field names to minimize JSON size.
    """
    id: Optional[str] = Field(None, alias="_id")
    t: Optional[str] = Field(None, description="title")
    bbox: Optional[List[float]] = None
    gsd: Optional[float] = None
    acq: Optional[str] = Field(None, description="acquisition_end")
    prov: Optional[str] = Field(None, description="provider")
    tms: Optional[str] = None
    th: Optional[str] = Field(None, description="thumbnail")

    model_config = {"populate_by_name": True}

    @classmethod
    def from_full(cls, full: ImageryResult) -> "CompactImagery":
        """Convert full ImageryResult to compact format."""
        return cls(
            id=full.id,
            t=full.title,
            bbox=full.bbox,
            gsd=full.gsd,
            acq=full.acquisition_end,
            prov=full.provider,
            tms=full.properties.tms if full.properties else None,
            th=full.properties.thumbnail if full.properties else None,
        )


class CompactSnapshotResponse(BaseModel):
    """Compact snapshot response with metadata."""
    count: int
    updated_at: str
    results: List[CompactImagery] = []


# STAC API models for OpenAerialMap local instance
class STACLink(BaseModel):
    """STAC Link object."""
    rel: str
    href: str
    type: Optional[str] = None
    title: Optional[str] = None


class STACAsset(BaseModel):
    """STAC Asset object."""
    href: str
    type: Optional[str] = None
    title: Optional[str] = None
    roles: Optional[List[str]] = None


class STACItemProperties(BaseModel):
    """STAC Item properties for OAM imagery."""
    datetime: Optional[str] = None
    gsd: Optional[float] = None
    license: Optional[str] = None
    # OAM Extension fields
    oam_producer_name: Optional[str] = Field(None, alias="oam:producer_name")
    oam_platform_type: Optional[str] = Field(None, alias="oam:platform_type")
    oam_hanko_user_id: Optional[str] = Field(None, alias="oam:hanko_user_id")

    model_config = {"populate_by_name": True}


class STACItemGeometry(BaseModel):
    """GeoJSON geometry for STAC item."""
    type: str
    coordinates: List


class STACItem(BaseModel):
    """STAC Item representing an OAM imagery."""
    type: str = "Feature"
    stac_version: Optional[str] = None
    stac_extensions: Optional[List[str]] = None
    id: str
    geometry: Optional[STACItemGeometry] = None
    bbox: Optional[List[float]] = None
    properties: STACItemProperties
    links: Optional[List[STACLink]] = None
    assets: Optional[dict[str, STACAsset]] = None
    collection: Optional[str] = None


class STACItemsResponse(BaseModel):
    """STAC FeatureCollection response."""
    type: str = "FeatureCollection"
    features: List[STACItem] = []
    links: Optional[List[STACLink]] = None
    numberMatched: Optional[int] = None
    numberReturned: Optional[int] = None
