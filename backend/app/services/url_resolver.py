"""URL → (app, project_id) parser for the plan resolve-url endpoint."""

import re

from app.models.plan import AppLiteral

_PATTERNS: list[tuple[re.Pattern[str], AppLiteral]] = [
    (re.compile(r"https?://tasks\.hotosm\.org/projects/(\d+)", re.I), "tasking-manager"),
    # Drone TM project IDs can be numeric or slug-based (e.g. "bo-phase-3")
    (re.compile(r"https?://drone\.hotosm\.org/projects/([^/\s?#]+)", re.I), "drone-tasking-manager"),
    (re.compile(r"https?://field\.hotosm\.org/projects/(\d+)", re.I), "field-tm"),
    (re.compile(r"https?://fair\.hotosm\.org/ai-models/(\d+)", re.I), "fair"),
    (re.compile(r"https?://export\.hotosm\.org/v3/exports/([0-9a-f\-]{8,})", re.I), "export-tool"),
    # OAM: https://map.openaerialmap.org/#/{coords}/latest/{hex-id}[?...]
    #      or /#/{coords}/user/{user-id}/{hex-id}[?...] (logged-in user view)
    (re.compile(r"https?://map\.openaerialmap\.org/#/[^/]+/(?:latest|user/[0-9a-f]+)/([0-9a-f]+)", re.I), "open-aerial-map"),
    # uMap: https://umap.hotosm.org/{locale}/map/{slug}_{id}[#...]
    (re.compile(r"https?://umap\.hotosm\.org/[a-z]{2,5}/map/[^#/]+_(\d+)", re.I), "umap"),
    # ChatMap: https://chatmap.hotosm.org/#map/{uuid}
    (re.compile(r"https?://chatmap\.hotosm\.org/#map/([0-9a-f-]+)", re.I), "chatmap"),
]


def parse_project_url(url: str) -> tuple[AppLiteral, str] | None:
    """Return (app, project_id) if url matches a known pattern, else None."""
    for pattern, app in _PATTERNS:
        m = pattern.match(url)
        if m:
            return app, m.group(1)
    return None
