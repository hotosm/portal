"""add plan_images table

Revision ID: 006_add_plan_images
Revises: 005_add_plan_is_public
Create Date: 2026-04-29
"""

import sqlalchemy as sa
from alembic import op


revision = "006_add_plan_images"
down_revision = "005_add_plan_is_public"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "plan_images",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("plan_id", sa.String(), nullable=False),
        sa.Column("s3_key", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["plans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_plan_images_plan_id", "plan_images", ["plan_id"])


def downgrade() -> None:
    op.drop_index("ix_plan_images_plan_id", table_name="plan_images")
    op.drop_table("plan_images")
