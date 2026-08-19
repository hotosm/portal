"""URL → (app, project_id) parser for the plan resolve-url endpoint."""

import re

from app.models.plan import AppLiteral
from app.services.open_aerial_map_service import TMS_ID_PREFIX

_PATTERNS: list[tuple[re.Pattern[str], AppLiteral, str]] = [
    (re.compile(r"https?://tasks\.hotosm\.org/projects/(\d+)", re.I), "tasking-manager", ""),
    # Drone TM project IDs can be numeric or slug-based (e.g. "bo-phase-3")
    (re.compile(r"https?://drone\.hotosm\.org/projects/([^/\s?#]+)", re.I), "drone-tasking-manager", ""),
    (re.compile(r"https?://(?:field\.hotosm\.org|field\.hotosm\.test|fieldtm\.testlogin\.hotosm\.org)/projects/(\d+)", re.I), "field-tm", ""),
    (re.compile(r"https?://fair\.hotosm\.org/ai-models/(\d+)", re.I), "fair", ""),
    # Export Tool: optional locale (e.g. /en/) and optional /v3/ path segments.
    (re.compile(r"https?://export\.hotosm\.org/(?:[a-z]{2}/)?(?:v3/)?exports/([0-9a-f\-]{8,})", re.I), "export-tool", ""),
    # OAM: https://map.openaerialmap.org/#/{coords}/latest/{hex-id}[?...]
    (re.compile(r"https?://map\.openaerialmap\.org/#/[^/]+/latest/([0-9a-f]+)", re.I), "open-aerial-map", ""),
    # OAM: /#/{coords}/user/{user-id}/{hex-id}[.ext][?...] (logged-in user view)
    # project_id encoded as "{user_id}:{image_id}" to preserve the user path segment.
    # The image ID sometimes carries a file extension (e.g. .tif) that is stripped.
    (re.compile(r"https?://map\.openaerialmap\.org/#/[^/]+/user/([0-9a-f]+)/([0-9a-f]+)(?:\.[a-z]+)?", re.I), "open-aerial-map", ""),
    # OAM TMS tile URL ("TMS" button on an image page) — stable format, unlike the
    # map.openaerialmap.org viewer URL above which has changed more than once.
    # The two ids are S3 object-path segments, NOT OAM's _id/user_id, so they can't
    # be used with GET /meta/{id} directly. Prefixed with "tms:" so
    # open_aerial_map_service.fetch_imagery_by_id knows to resolve them via a
    # uuid-substring search instead of a direct /meta/{id} lookup.
    (re.compile(r"https?://tiles\.openaerialmap\.org/([0-9a-f]{24})/\d+/([0-9a-f]{24})", re.I), "open-aerial-map", TMS_ID_PREFIX),
    # uMap: https://umap.hotosm.org/{locale}/map/{slug}_{id}[#...]
    (re.compile(r"https?://umap\.hotosm\.org/[a-z]{2,5}/map/[^#/]+_(\d+)", re.I), "umap", ""),
    # ChatMap: https://chatmap.hotosm.org/#map/{uuid}
    (re.compile(r"https?://chatmap\.hotosm\.org/#map/([0-9a-f-]+)", re.I), "chatmap", ""),
]


def parse_project_url(url: str) -> tuple[AppLiteral, str] | None:
    """Return (app, project_id) if url matches a known pattern, else None.

    For OAM /user/ URLs, project_id is encoded as "{user_id}:{image_id}" so the
    user path segment can be reconstructed when building the link back to OAM.

    Accepts URLs pasted without a scheme (e.g. "export.hotosm.org/...") by
    defaulting to https://.
    """
    url = url.strip()
    if url and not re.match(r"https?://", url, re.I):
        url = f"https://{url}"

    for pattern, app, id_prefix in _PATTERNS:
        m = pattern.match(url)
        if m:
            project_id = ":".join(m.groups()) if len(m.groups()) > 1 else m.group(1)
            return app, f"{id_prefix}{project_id}"
    return None
