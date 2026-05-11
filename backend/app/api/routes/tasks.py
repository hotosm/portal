from fastapi import APIRouter, Depends, HTTPException, Path, Response, status
from hotosm_auth_fastapi import CurrentUser
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.task import TaskCreate, TaskRead, TaskUpdate
from app.services import tasks_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskRead])
async def list_tasks(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> list[TaskRead]:
    return await tasks_service.list_tasks(db, user.id)


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    return await tasks_service.create_task(db, user.id, payload)


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    user: CurrentUser,
    task_id: str = Path(..., description="Task UUID"),
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    task = await tasks_service.get_task(db, user.id, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    payload: TaskUpdate,
    user: CurrentUser,
    task_id: str = Path(..., description="Task UUID"),
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    task = await tasks_service.update_task(db, user.id, task_id, payload)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user: CurrentUser,
    task_id: str = Path(..., description="Task UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    ok = await tasks_service.delete_task(db, user.id, task_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
