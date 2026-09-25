"""SketchMap Tool artifact download endpoints.

Fetches the printable PDF ("create" flow) or merged GeoJSON ("digitize" flow)
from SketchMap Tool once, stores it in S3/MinIO, and serves it back from
Portal from then on — SketchMap Tool's own copy expires (digitize results
after 24h) so the "Open Project" link is replaced with a download instead.
"""

import unicodedata
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Path, Request, Response, status
from hotosm_auth_fastapi import CurrentUser, CurrentUserOptional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.db.models.plan import Plan, PlanProject
from app.models.plan import PlanProjectArtifact
from app.services import permissions, plans_service, s3_service
from app.services.exceptions import ArtifactNotReadyError, UpstreamUnavailable
from app.services.plans_service import ArtifactAppMismatchError

router = APIRouter(tags=["plan-sketchmap-files"])


def _generic_filename(row: PlanProject, ext: str) -> str:
    flow = (row.project_id or "sketchmap-tool").split(":", 1)[0]
    return f"sketchmap-tool-{flow}-{row.id}{ext}"


def _content_filename(row: PlanProject) -> str:
    ext = ".pdf" if row.artifact_content_type == "application/pdf" else ".geojson"
    if row.custom_title:
        # str.isalnum() is true for any Unicode letter, so this keeps the title
        # as the user wrote it — Cyrillic, Japanese and all. Encoding it for the
        # header is _content_disposition's job.
        slug = "".join(c if c.isalnum() or c in "-_ " else "" for c in row.custom_title).strip()
        slug = slug.replace(" ", "-")
        if slug:
            return f"{slug}{ext}"
    return _generic_filename(row, ext)


def _content_disposition(filename: str, fallback: str) -> str:
    """Build a Content-Disposition header that survives a non-Latin-1 title.

    Starlette encodes raw headers as latin-1, so a plan called e.g. "地図" used
    to raise UnicodeEncodeError while building the response — a 500 on every
    download of a perfectly good file. RFC 5987/6266 says to send both forms:
    an ASCII `filename` for the fallback, and a percent-encoded `filename*`
    that every current browser prefers.
    """
    ascii_name = unicodedata.normalize("NFKD", filename).encode("ascii", "ignore").decode()
    ascii_name = ascii_name.strip().strip('"')
    # Folding a fully non-Latin title leaves only the separators and the
    # extension ("地図 Карта.pdf" -> "-.pdf"), which is not empty but is no
    # name either — fall back whenever nothing alphanumeric survived.
    if not any(c.isalnum() for c in ascii_name.rsplit(".", 1)[0]):
        ascii_name = fallback
    return f"attachment; filename=\"{ascii_name}\"; filename*=UTF-8''{quote(filename, safe='')}"


@router.post(
    "/{plan_id}/projects/{plan_project_id}/sketchmap-file",
    response_model=PlanProjectArtifact,
    status_code=status.HTTP_200_OK,
)
async def create_sketchmap_file(
    user: CurrentUser,
    request: Request,
    plan_id: str = Path(...),
    plan_project_id: str = Path(...),
    db: AsyncSession = Depends(get_db),
) -> PlanProjectArtifact:
    """Fetch (if not already stored) and return metadata for the downloadable
    artifact backing a SketchMap Tool plan project."""
    ctx = await permissions.build_context(user, request.cookies.get("hanko"))
    try:
        artifact = await plans_service.ensure_sketchmap_artifact(
            db, ctx, plan_id, plan_project_id
        )
    except ArtifactAppMismatchError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except ArtifactNotReadyError:
        raise HTTPException(status_code=409, detail="not_ready")
    except UpstreamUnavailable:
        raise HTTPException(status_code=502, detail="upstream_unavailable")
    if artifact is None:
        raise HTTPException(status_code=404, detail="Plan or project not found")
    return artifact


@router.get(
    "/{plan_id}/projects/{plan_project_id}/sketchmap-file/content",
    response_class=Response,
    responses={
        200: {
            "content": {"application/pdf": {}, "application/geo+json": {}},
            "description": "Raw file binary content.",
        }
    },
)
async def get_sketchmap_file_content(
    request: Request,
    plan_id: str = Path(...),
    plan_project_id: str = Path(...),
    user: CurrentUserOptional = None,
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Stream the stored SketchMap Tool artifact as a download.

    Requires the plan to be viewable by the current user context (public,
    private, or shared) — same rule as plan image content.
    """
    result = await db.execute(
        select(PlanProject, Plan)
        .join(Plan, Plan.id == PlanProject.plan_id)
        .where(PlanProject.id == plan_project_id, PlanProject.plan_id == plan_id)
    )
    row = result.one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Project not found")

    project, plan = row
    ctx = await permissions.build_context(user, request.cookies.get("hanko"))
    if not permissions.can_view(plan, ctx):
        raise HTTPException(status_code=403, detail="Forbidden")
    if not project.artifact_s3_key:
        raise HTTPException(status_code=404, detail="Artifact not yet fetched")

    if s3_service.is_local_key(project.artifact_s3_key):
        data = s3_service.get_plan_project_file_local(project.artifact_s3_key)
    else:
        data = s3_service.get_plan_project_file(project.artifact_s3_key)

    filename = _content_filename(project)
    ext = ".pdf" if project.artifact_content_type == "application/pdf" else ".geojson"
    return Response(
        content=data,
        media_type=project.artifact_content_type or "application/octet-stream",
        headers={
            "Content-Disposition": _content_disposition(
                filename, _generic_filename(project, ext)
            )
        },
    )
