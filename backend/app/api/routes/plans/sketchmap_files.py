"""SketchMap Tool artifact download endpoints.

Fetches the printable PDF ("create" flow) or merged GeoJSON ("digitize" flow)
from SketchMap Tool once, stores it in S3/MinIO, and serves it back from
Portal from then on — SketchMap Tool's own copy expires (digitize results
after 24h) so the "Open Project" link is replaced with a download instead.
"""

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


def _content_filename(row: PlanProject) -> str:
    ext = ".pdf" if row.artifact_content_type == "application/pdf" else ".geojson"
    if row.custom_title:
        slug = "".join(c if c.isalnum() or c in "-_ " else "" for c in row.custom_title).strip()
        slug = slug.replace(" ", "-")
        if slug:
            return f"{slug}{ext}"
    flow = (row.project_id or "sketchmap-tool").split(":", 1)[0]
    return f"sketchmap-tool-{flow}-{row.id}{ext}"


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
    return Response(
        content=data,
        media_type=project.artifact_content_type or "application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
