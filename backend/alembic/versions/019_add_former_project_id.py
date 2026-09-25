"""add plan_projects.former_project_id

When a live hydration gets a definitive 404, the row is turned into a task
(project_exists=False) and its project_id is cleared, so it stops occupying the
(plan_id, app, project_id) unique slot. Clearing it outright made the link
unrecoverable: hydrate_one returns early for a row with project_exists=False,
so nothing can ever re-derive the id — a single misread 404 (an upstream that
answers 200 with an unexpected payload, say) destroyed the link for good.

This column keeps the last known project_id so the link can be restored.

Revision ID: 019_add_former_project_id
Revises: 018_add_plan_artifact_fields
Create Date: 2026-09-24
"""

import sqlalchemy as sa

from alembic import op

revision = "019_add_former_project_id"
down_revision = "018_add_plan_artifact_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("plan_projects", sa.Column("former_project_id", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("plan_projects", "former_project_id")
