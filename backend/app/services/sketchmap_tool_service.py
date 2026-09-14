"""SketchMap Tool service: resolve "create" and "digitize" job URLs.

SketchMap Tool (https://sketch-map-tool.heigit.org, a HeiGIT tool, not a HOT
one) has no project concept — its URLs reference Celery jobs, not named
resources:

- "create" jobs (generate a printable map) carry their bbox in the URL
  itself, so they need no upstream call at all: the bbox never expires,
  unlike anything living on SketchMap Tool's server.
- "digitize" jobs (process an uploaded scan) only resolve via SketchMap
  Tool's `/api/status` and `/api/download` endpoints, and SketchMap Tool
  forgets the underlying Celery result after 24h (`result_expires`). Once a
  digitize job finishes, its (small) merged GeoJSON output is downloaded and
  embedded in the returned dict so the caller can persist it — see the
  sketchmap-tool special case in plans_service.hydrate_one, which serves a
  saved GeoJSON snapshot forever without re-checking upstream, since a later
  404 there means "HeiGIT's 24h cleanup ran", not "this never existed".
"""

import json

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.services.exceptions import UpstreamUnavailable

SKETCHMAP_TOOL_BASE_URL = "https://sketch-map-tool.heigit.org"

# SketchMap Tool 500s on a locale it doesn't recognize rather than normalizing
# to a default, so a missing/unsupported locale falls back to one it actually
# serves rather than to whatever the caller happened to omit.
DEFAULT_LOCALE = "en"

# SketchMap Tool merges/simplifies digitized geometries before export, so this
# normally runs a few KB — generous ceiling against a pathological upload
# (many sheets, or a future upstream change that stops simplifying) bloating
# the plan_projects.data column. Past this, the digitize result is treated
# like it isn't ready yet rather than stored.
_MAX_GEOJSON_BYTES = 200_000


async def fetch_project_by_id(
    project_id: str,
    *,
    base_url: str | None = None,
    force_refresh: bool = False,
) -> dict | None:
    """Resolve a "create:<locale>:<uuid>:<bbox>" or "digitize:<locale>:<uuid>"
    project id (locale may be empty, e.g. an older saved project).

    None on a genuinely nonexistent digitize job, raises UpstreamUnavailable on
    upstream failure. "create" ids never hit the network and never return None.
    """
    if project_id.startswith("create:"):
        _, locale, uuid, bbox = project_id.split(":", 3)
        bounds = [float(x) for x in bbox.split(",")]  # lon_min,lat_min,lon_max,lat_max
        return {
            "name": "SketchMap Tool",
            "flow": "create",
            "bbox": bounds,
            "locale": locale or DEFAULT_LOCALE,
        }

    _, locale, uuid = project_id.split(":", 2)
    return await _fetch_digitize_result(uuid, locale or DEFAULT_LOCALE, base_url, force_refresh=force_refresh)


async def _fetch_digitize_result(
    uuid: str, locale: str, base_url: str | None, *, force_refresh: bool
) -> dict | None:
    base = base_url or SKETCHMAP_TOOL_BASE_URL

    # Never cached: must see a fresh status on every hydration until SUCCESS.
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{base}/api/status/{uuid}/vector-results")
            if response.status_code == 404:
                return None
            response.raise_for_status()
            status = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"sketchmap-tool: {e}") from e

    result: dict = {
        "name": "SketchMap Tool",
        "flow": "digitize",
        "status": status.get("status"),
        "locale": locale,
    }
    if status.get("status") != "SUCCESS":
        return result

    geojson_cache_key = f"sketchmap_tool_digitize_geojson_{uuid}"
    geojson = None if force_refresh else get_cached(geojson_cache_key)
    if geojson is None:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{base}/api/download/{uuid}/vector-results")
                response.raise_for_status()
                geojson = response.json()
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            raise UpstreamUnavailable(f"sketchmap-tool: {e}") from e
        set_cached(geojson_cache_key, geojson, DEFAULT_TTL)

    if geojson is not None and len(json.dumps(geojson)) <= _MAX_GEOJSON_BYTES:
        result["geojson"] = geojson
    return result
