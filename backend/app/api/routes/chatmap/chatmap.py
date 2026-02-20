import httpx
from fastapi import APIRouter, HTTPException, Request
from hotosm_auth_fastapi import CurrentUser
from app.core.config import settings

CHATMAP_API_BASE_URL = settings.chatmap_api_base_url

router = APIRouter(prefix="/chatmap")


@router.get("/map")
async def get_my_chatmap(
    request: Request,
    user: CurrentUser,
) -> dict:
    """
    Get the authenticated user's ChatMap (GeoJSON FeatureCollection).

    Forwards the Hanko auth cookie to the ChatMap API, which returns
    the map belonging to the authenticated user.
    """
    hanko_cookie = request.cookies.get("hanko")
    if not hanko_cookie:
        raise HTTPException(status_code=401, detail="Hanko auth cookie not found")

    url = f"{CHATMAP_API_BASE_URL}/map"

    async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
        try:
            response = await client.get(
                url,
                cookies={"hanko": hanko_cookie},
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from ChatMap API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
