"""Groups and Tags API endpoints — open-text taxonomies for plan projects/tasks.

Exposed under /project-groups (not /groups: that path already serves the
login team/organization membership proxy at app/api/routes/groups.py) and
/tags. Assigning a Group/Tag to a specific plan project/task is a separate
endpoint under /plans/{plan_id}/projects/{plan_project_id}/... in
app/api/routes/plans/plans.py, since that acts on PlanProject.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Request, Response, status
from hotosm_auth_fastapi import CurrentUser
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.taxonomy import (
    GroupCreate,
    GroupRead,
    GroupUpdate,
    TagCreate,
    TagRead,
    TagUpdate,
)
from app.services import permissions, taxonomy_service
from app.services.permissions import PermissionContext
from app.services.taxonomy_service import DuplicateNameError, GroupMembershipError

router = APIRouter(tags=["taxonomy"])


async def permission_ctx(request: Request, user: CurrentUser) -> PermissionContext:
    """Resolve the user's group memberships once per request (auth required)."""
    return await permissions.build_context(user, request.cookies.get("hanko"))


PermCtx = Annotated[PermissionContext, Depends(permission_ctx)]


@router.get("/project-groups", response_model=list[GroupRead])
async def list_groups(
    ctx: PermCtx,
    db: AsyncSession = Depends(get_db),
) -> list[GroupRead]:
    """List groups visible to the user: their own, plus their team's/org's."""
    return await taxonomy_service.list_groups(db, ctx)


@router.post("/project-groups", response_model=GroupRead, status_code=status.HTTP_201_CREATED)
async def create_group(
    payload: GroupCreate,
    ctx: PermCtx,
    db: AsyncSession = Depends(get_db),
) -> GroupRead:
    """Create a group owned by the authenticated user."""
    try:
        return await taxonomy_service.create_group(db, ctx, payload)
    except GroupMembershipError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except DuplicateNameError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.patch("/project-groups/{group_id}", response_model=GroupRead)
async def update_group(
    payload: GroupUpdate,
    ctx: PermCtx,
    group_id: str = Path(..., description="Group UUID"),
    db: AsyncSession = Depends(get_db),
) -> GroupRead:
    """Update a group's name/description."""
    try:
        group = await taxonomy_service.update_group(db, ctx, group_id, payload)
    except DuplicateNameError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.delete("/project-groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    ctx: PermCtx,
    group_id: str = Path(..., description="Group UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a group; plan projects that only had this group fall back to "All"."""
    ok = await taxonomy_service.delete_group(db, ctx, group_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Group not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/tags", response_model=list[TagRead])
async def list_tags(
    ctx: PermCtx,
    db: AsyncSession = Depends(get_db),
) -> list[TagRead]:
    """List tags visible to the user: their own, plus their team's/org's."""
    return await taxonomy_service.list_tags(db, ctx)


@router.post("/tags", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag(
    payload: TagCreate,
    ctx: PermCtx,
    db: AsyncSession = Depends(get_db),
) -> TagRead:
    """Create a tag owned by the authenticated user."""
    try:
        return await taxonomy_service.create_tag(db, ctx, payload)
    except GroupMembershipError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except DuplicateNameError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.patch("/tags/{tag_id}", response_model=TagRead)
async def update_tag(
    payload: TagUpdate,
    ctx: PermCtx,
    tag_id: str = Path(..., description="Tag UUID"),
    db: AsyncSession = Depends(get_db),
) -> TagRead:
    """Rename a tag."""
    try:
        tag = await taxonomy_service.update_tag(db, ctx, tag_id, payload)
    except DuplicateNameError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    ctx: PermCtx,
    tag_id: str = Path(..., description="Tag UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a tag; plan projects that had this tag simply lose it."""
    ok = await taxonomy_service.delete_tag(db, ctx, tag_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Tag not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
