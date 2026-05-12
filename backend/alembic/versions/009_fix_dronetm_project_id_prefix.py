"""fix drone-tasking-manager project_id prefix in plan_projects

Revision ID: 009_fix_dronetm_project_id_prefix
Revises: 008_plan_project_order
Create Date: 2026-05-11
"""

from alembic import op

revision = "009_fix_dronetm_proj_id"
down_revision = "008_plan_project_order"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE plan_projects
        SET project_id = substring(project_id FROM 7)
        WHERE app = 'drone-tasking-manager'
          AND project_id LIKE 'drone-%'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE plan_projects
        SET project_id = 'drone-' || project_id
        WHERE app = 'drone-tasking-manager'
          AND project_id NOT LIKE 'drone-%'
        """
    )
