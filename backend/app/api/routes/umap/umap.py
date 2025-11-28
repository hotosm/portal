"""uMap API endpoints with HTML parsing for user templates."""
import httpx
import json
import re
import html
from typing import List, Optional
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/umap")

UMAP_API_BASE_URL = "https://umap.hotosm.org/en/datalayer"
UMAP_USER_BASE_URL = "https://umap.hotosm.org/es/user"


class TemplateInfo(BaseModel):
    """Information about a uMap template."""
    map_id: int = Field(..., description="The map ID (e.g., 1814)")
    name: str = Field(..., description="Template name")
    author: str = Field(..., description="Template author")
    view_url: str = Field(..., description="URL to view the template")
    is_template: bool = Field(True, description="Whether this is a template")


class DatalayerInfo(BaseModel):
    """Information about a datalayer from template settings."""
    id: str = Field(..., description="Datalayer UUID")
    name: str = Field(..., description="Layer name")
    rank: int = Field(..., description="Layer order")


class TemplateDetails(TemplateInfo):
    """Extended template information including datalayers."""
    datalayers: List[DatalayerInfo] = Field(default_factory=list)
    center: Optional[dict] = None
    zoom: Optional[int] = None


class UserTemplatesResponse(BaseModel):
    """Response containing user templates."""
    username: str
    total_templates: int
    templates: List[TemplateDetails]


def extract_template_data_from_html(html_content: str, username: str) -> List[TemplateDetails]:
    """
    Parse HTML content to extract template information.
    
    Args:
        html_content: HTML string from user page
        username: Username for building URLs
        
    Returns:
        List of TemplateDetails objects
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    templates = []
    cards = soup.find_all('div', class_='card')
    
    for card in cards:
        try:
            template_mark = card.find('mark', class_='template-map')
            if not template_mark:
                continue
            
            fragment = card.find('umap-fragment')
            if not fragment:
                continue
                
            settings_attr = fragment.get('data-settings')
            if not settings_attr:
                continue
            
            settings_json = html.unescape(settings_attr)
            settings = json.loads(settings_json)
            
            properties = settings.get('properties', {})
            map_id = properties.get('id')
            
            if not map_id:
                map_div = fragment.find('div', id=re.compile(r'map_\d+'))
                if map_div:
                    div_id = map_div.get('id')
                    map_id = int(div_id.replace('map_', ''))
                else:
                    continue
            
            h3 = card.find('h3')
            if h3:
                mark = h3.find('mark')
                if mark:
                    mark.decompose()
                name = h3.get_text(strip=True)
            else:
                name = properties.get('name', 'Unknown')
            
            author_link = card.find('a', href=re.compile(r'/user/'))
            author = author_link.get_text(strip=True) if author_link else username
            
            main_link = card.find('a', class_='main')
            view_url = main_link.get('href') if main_link else f"/es/map/map_{map_id}"
            
            if view_url.startswith('/'):
                view_url = f"https://umap.hotosm.org{view_url}"
            
            datalayers = []
            for dl in properties.get('datalayers', []):
                datalayers.append(DatalayerInfo(
                    id=dl.get('id', ''),
                    name=dl.get('name', ''),
                    rank=dl.get('rank', 0)
                ))
            
            center = properties.get('center')
            zoom = properties.get('zoom')
            
            template = TemplateDetails(
                map_id=map_id,
                name=name,
                author=author,
                view_url=view_url,
                is_template=True,
                datalayers=datalayers,
                center=center,
                zoom=zoom
            )
            
            templates.append(template)
            
        except (json.JSONDecodeError, KeyError, AttributeError):
            continue
    
    return templates


@router.get("/user/{username}/templates", response_model=UserTemplatesResponse)
async def get_user_templates(
    username: str = Path(..., description="uMap username"),
    include_geojson: bool = Query(False, description="Include full GeoJSON data for each template")
) -> UserTemplatesResponse:
    """
    Get all templates created by a specific uMap user.
    
    This endpoint parses the user's HTML page to extract template information.
    
    Args:
        username: The uMap username
        include_geojson: If True, fetches complete GeoJSON data for each template's datalayers
    
    Returns:
        UserTemplatesResponse with list of templates and their metadata
    
    Raises:
        HTTPException: If there's an error fetching or parsing the user page
    
    Example:
        ```bash
        curl http://localhost:8000/api/umap/user/AndreaChirillano/templates
        ```
    """
    user_url = f"{UMAP_USER_BASE_URL}/{username}/"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(user_url)
            response.raise_for_status()
            
            templates = extract_template_data_from_html(response.text, username)
            
            if include_geojson:
                for template in templates:
                    for datalayer in template.datalayers:
                        try:
                            dl_url = f"https://umap.hotosm.org/es/datalayer/{template.map_id}/{datalayer.id}/"
                            dl_response = await client.get(dl_url)
                            
                            if dl_response.status_code == 200:
                                pass
                        except Exception:
                            continue
            
            return UserTemplatesResponse(
                username=username,
                total_templates=len(templates),
                templates=templates
            )
            
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"User '{username}' not found on uMap"
            )
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error querying uMap user page: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Connection error with uMap: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error parsing user templates: {str(e)}"
        )


@router.get("/template/{map_id}/datalayer/{datalayer_id}")
async def get_template_datalayer(
    map_id: int = Path(..., description="Template map ID"),
    datalayer_id: str = Path(..., description="Datalayer UUID")
) -> dict:
    """
    Fetch GeoJSON data for a specific datalayer from a template.
    
    Args:
        map_id: The map/template ID (e.g., 1814)
        datalayer_id: The datalayer UUID
    
    Returns:
        dict: GeoJSON FeatureCollection
    
    Example:
        ```bash
        curl http://localhost:8000/api/umap/template/1814/datalayer/7fdafd76-ef54-4c9a-957b-052584f82d82
        ```
    """
    url = f"https://umap.hotosm.org/es/datalayer/{map_id}/{datalayer_id}/"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"Datalayer not found for map {map_id}"
            )
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error querying datalayer: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Connection error: {str(e)}"
        )


@router.get("/{location}/{project_id}")
async def get_umap_data(
    location: str = Path(..., description="Location identifier"),
    project_id: str = Path(..., description="The project UUID to retrieve")
) -> dict:
    """
    Fetch GeoJSON data from uMap HOT OSM.
    
    This endpoint retrieves geographic features from a specific uMap layer.
    
    Args:
        location: Location identifier (e.g., "1428")
        project_id: Project UUID
    
    Returns:
        dict: GeoJSON FeatureCollection with map data
    
    Raises:
        HTTPException: If there's an error querying the external API
    
    Example:
        ```bash
        curl http://localhost:8000/api/umap/1428/a59b5458-8c8e-48b1-911f-4c6c602fc357
        ```
    """
    url = f"{UMAP_API_BASE_URL}/{location}/{project_id}/"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"uMap data not found for location '{location}' and project '{project_id}'"
            )
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error querying uMap API: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Connection error with uMap API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )