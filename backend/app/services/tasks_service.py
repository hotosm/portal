from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.task import Task
from app.models.task import TaskCreate, TaskRead, TaskUpdate


def _to_read(task: Task) -> TaskRead:
    return TaskRead(
        id=task.id,
        title=task.title,
        tool=task.tool,
        project_app=task.project_app,
        project_id=task.project_id,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


async def _get_owned_task(
    db: AsyncSession, owner_id: str, task_id: str
) -> Task | None:
    stmt = select(Task).where(Task.id == task_id, Task.owner_id == owner_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def list_tasks(db: AsyncSession, owner_id: str) -> list[TaskRead]:
    stmt = (
        select(Task)
        .where(Task.owner_id == owner_id)
        .order_by(Task.created_at.desc())
    )
    result = await db.execute(stmt)
    return [_to_read(t) for t in result.scalars().all()]


async def create_task(
    db: AsyncSession, owner_id: str, payload: TaskCreate
) -> TaskRead:
    task = Task(
        owner_id=owner_id,
        title=payload.title,
        tool=payload.tool,
        project_app=payload.project_app,
        project_id=payload.project_id,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return _to_read(task)


async def get_task(
    db: AsyncSession, owner_id: str, task_id: str
) -> TaskRead | None:
    task = await _get_owned_task(db, owner_id, task_id)
    if task is None:
        return None
    return _to_read(task)


async def update_task(
    db: AsyncSession, owner_id: str, task_id: str, payload: TaskUpdate
) -> TaskRead | None:
    task = await _get_owned_task(db, owner_id, task_id)
    if task is None:
        return None
    task.title = payload.title
    task.tool = payload.tool
    task.project_app = payload.project_app
    task.project_id = payload.project_id
    await db.flush()
    await db.refresh(task)
    return _to_read(task)


async def delete_task(db: AsyncSession, owner_id: str, task_id: str) -> bool:
    task = await _get_owned_task(db, owner_id, task_id)
    if task is None:
        return False
    await db.delete(task)
    await db.flush()
    return True
