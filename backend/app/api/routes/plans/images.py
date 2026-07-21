"""Plan image upload/delete endpoints."""

import io

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Path,
    Request,
    Response,
    UploadFile,
    status,
)
from hotosm_auth_fastapi import CurrentUser, CurrentUserOptional
from PIL import Image
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.db.models.plan import Plan, PlanImage
from app.models.plan import PlanImageRead
from app.services import permissions, plans_service, s3_service

router = APIRouter(tags=["plan-images"])

_ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/svg+xml", "image/webp"}
_MAX_SIZE = 10 * 1024 * 1024  # 10 MB


def _image_url(plan_id: str, image_id: str) -> str:
    base = (settings.portal_base_url or "").rstrip("/")
    return f"{base}/api/plans/{plan_id}/images/{image_id}/content"


@router.get("/{plan_id}/images/{image_id}/content", include_in_schema=False)
async def get_plan_image_content(
    request: Request,
    plan_id: str = Path(...),
    image_id: str = Path(...),
    user: CurrentUserOptional = None,
    db: AsyncSession = Depends(get_db),
) -> Response:
    result = await db.execute(
        select(PlanImage, Plan)
        .join(Plan, Plan.id == PlanImage.plan_id)
        .where(PlanImage.id == image_id, PlanImage.plan_id == plan_id)
    )
    row = result.one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Image not found")

    image, plan = row
    ctx = await permissions.build_context(user, request.cookies.get("hanko"))
    if not permissions.can_view(plan, ctx):
        raise HTTPException(status_code=403, detail="Forbidden")

    if s3_service.is_local_key(image.s3_key):
        data, content_type = s3_service.get_plan_image_local(image.s3_key)
    else:
        data, content_type = s3_service.get_plan_image(image.s3_key)
    return Response(content=data, media_type=content_type)


@router.post("/{plan_id}/images", response_model=PlanImageRead, status_code=status.HTTP_201_CREATED)
async def upload_plan_image(
    user: CurrentUser,
    request: Request,
    plan_id: str = Path(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> PlanImageRead:
    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported image type")

    data = await file.read()
    if len(data) > _MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    ctx = await permissions.build_context(user, request.cookies.get("hanko"))
    plan = await plans_service.get_editable_plan(db, ctx, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")

    if file.content_type == "image/svg+xml":
        upload_data, upload_content_type, upload_ext = data, "image/svg+xml", ".svg"
    else:
        buf = io.BytesIO()
        img = Image.open(io.BytesIO(data))
        img.save(buf, format="WEBP", quality=85)
        upload_data, upload_content_type, upload_ext = buf.getvalue(), "image/webp", ".webp"

    if s3_service.is_s3_configured():
        s3_key = s3_service.upload_plan_image(upload_data, upload_content_type, plan_id, upload_ext)
    else:
        s3_key = s3_service.upload_plan_image_local(upload_data, upload_content_type, plan_id, upload_ext)

    image = PlanImage(
        plan_id=plan_id,
        s3_key=s3_key,
        url="",
        display_order=len(plan.images),
    )
    db.add(image)
    await db.flush()
    await db.refresh(image)

    image.url = _image_url(plan_id, image.id)
    await db.flush()

    return PlanImageRead(
        id=image.id,
        url=image.url,
        display_order=image.display_order,
        created_at=image.created_at,
    )


@router.delete("/{plan_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan_image(
    user: CurrentUser,
    request: Request,
    plan_id: str = Path(...),
    image_id: str = Path(...),
    db: AsyncSession = Depends(get_db),
) -> Response:
    ctx = await permissions.build_context(user, request.cookies.get("hanko"))
    plan = await plans_service.get_editable_plan(db, ctx, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")

    result = await db.execute(
        select(PlanImage).where(PlanImage.id == image_id, PlanImage.plan_id == plan_id)
    )
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")

    if s3_service.is_local_key(image.s3_key):
        s3_service.delete_plan_image_local(image.s3_key)
    else:
        s3_service.delete_plan_image(image.s3_key)
    await db.delete(image)
    await db.flush()

    remaining = [img for img in plan.images if img.id != image_id]
    for i, img in enumerate(remaining):
        if img.display_order != i:
            await db.execute(
                update(PlanImage).where(PlanImage.id == img.id).values(display_order=i)
            )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
