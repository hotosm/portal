"""Convert legacy empty-string slots into proper tasks.

The old picker (develop #155) represented "pending" placeholders as
plan_projects rows with project_id = '' and project_exists = true.
The new model represents tasks as project_id = NULL and
project_exists = false.

This migration converts any leftover legacy slots so the new frontend
treats them as tasks instead of orphan projects.
"""

from alembic import op

revision = "011_convert_empty_slots"
down_revision = "010_add_project_exists"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE plan_projects
        SET project_exists = false, project_id = NULL
        WHERE project_id = ''
        """
    )


def downgrade() -> None:
    # Best-effort revert: only rows that look like they came from this
    # migration (task with no data) are restored to the legacy shape.
    op.execute(
        """
        UPDATE plan_projects
        SET project_exists = true, project_id = ''
        WHERE project_exists = false
          AND project_id IS NULL
          AND data IS NULL
        """
    )
