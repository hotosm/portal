import logging
import httpx
from fastapi import APIRouter, HTTPException, Path, Request
from hotosm_auth_fastapi import CurrentUser
from app.core.config import settings

logger = logging.getLogger(__name__)

CHATMAP_API_URL = settings.chatmap_api_url

router = APIRouter(prefix="/chatmap")


@router.get("/user/maps")
async def get_user_maps(
    user: CurrentUser,
) -> dict:
    """
    Get the authenticated user's ChatMap maps from production.

    Uses user.id which is consistent across environments (local/test/prod).
    No Hanko cookie required — the endpoint is public.
    """
    url = f"{CHATMAP_API_URL}/user/{user.id}/map"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            logger.info("[ChatMap] Retrieved maps for user %s", user.id)
            if isinstance(data, list):
                return {"maps": data}
            return data
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from ChatMap API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/map/{map_id}")
async def get_chatmap_by_id(
    map_id: str = Path(..., description="ChatMap map UUID"),
) -> dict:
    """
    Get a public ChatMap map by ID.
    """
    url = f"{CHATMAP_API_URL}/map/{map_id}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from ChatMap API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/map")
async def get_my_chatmap(
    request: Request,
    user: CurrentUser,
) -> dict:
    """
    Get the authenticated user's ChatMap using their Hanko cookie.
    """
    hanko_cookie = request.cookies.get("hanko")
    if not hanko_cookie:
        raise HTTPException(status_code=401, detail="Hanko auth cookie not found.")

    url = f"{CHATMAP_API_URL}/map"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, cookies={"hanko": hanko_cookie})
            response.raise_for_status()
            data = response.json()
            logger.info("[ChatMap] Retrieved map for user %s", user.id)
            return data
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from ChatMap API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
