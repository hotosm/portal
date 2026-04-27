"""add is_public column to plans table

Revision ID: 005_add_plan_is_public
Revises: 004_add_plans_tables
Create Date: 2026-04-24
"""

from alembic import op
import sqlalchemy as sa


revision = "005_add_plan_is_public"
down_revision = "004_add_plans_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "plans",
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.create_index("ix_plans_is_public", "plans", ["is_public"])


def downgrade() -> None:
    op.drop_index("ix_plans_is_public", table_name="plans")
    op.drop_column("plans", "is_public")
