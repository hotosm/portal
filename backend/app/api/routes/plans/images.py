"""Plan image upload/delete endpoints."""

from sqlalchemy import select, update
from fastapi import APIRouter, Depends, File, HTTPException, Path, Response, UploadFile, status
from hotosm_auth_fastapi import CurrentUser
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.db.models.plan import PlanImage
from app.models.plan import PlanImageRead
from app.services import plans_service, s3_service

router = APIRouter(tags=["plan-images"])

_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_SIZE = 10 * 1024 * 1024  # 10 MB


def _require_s3() -> None:
    if not s3_service.is_s3_configured():
        raise HTTPException(status_code=503, detail="Image storage not configured")


@router.post("/{plan_id}/images", response_model=PlanImageRead, status_code=status.HTTP_201_CREATED)
async def upload_plan_image(
    user: CurrentUser,
    plan_id: str = Path(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> PlanImageRead:
    _require_s3()

    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported image type")

    data = await file.read()
    if len(data) > _MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")
    await file.seek(0)

    plan = await plans_service.get_owned_plan(db, user.id, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")

    s3_key, url = s3_service.upload_plan_image(file, plan_id)

    image = PlanImage(
        plan_id=plan_id,
        s3_key=s3_key,
        url=url,
        display_order=len(plan.images),
    )
    db.add(image)
    await db.flush()
    await db.refresh(image)

    return PlanImageRead(
        id=image.id,
        url=image.url,
        display_order=image.display_order,
        created_at=image.created_at,
    )


@router.delete("/{plan_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan_image(
    user: CurrentUser,
    plan_id: str = Path(...),
    image_id: str = Path(...),
    db: AsyncSession = Depends(get_db),
) -> Response:
    _require_s3()

    plan = await plans_service.get_owned_plan(db, user.id, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")

    result = await db.execute(
        select(PlanImage).where(PlanImage.id == image_id, PlanImage.plan_id == plan_id)
    )
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")

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
