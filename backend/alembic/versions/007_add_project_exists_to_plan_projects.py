import sqlalchemy as sa
from alembic import op

revision = "007_add_project_exists_to_plan_projects"
down_revision = "006_add_plan_images"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "plan_projects",
        sa.Column(
            "project_exists",
            sa.Boolean(),
            nullable=False,
            server_default="true",
        ),
    )
    op.alter_column("plan_projects", "app", nullable=True)
    op.alter_column("plan_projects", "project_id", nullable=True)


def downgrade() -> None:
    op.alter_column("plan_projects", "project_id", nullable=False)
    op.alter_column("plan_projects", "app", nullable=False)
    op.drop_column("plan_projects", "project_exists")
