"""replace plan visibility/group scope with grants; the group becomes an attribution

Adds a plan_grants table (user / team / organization / link → viewer | editor)
and moves the old scope columns into it. Ownership doesn't change: owner_id is
still the creator.

* visibility='public'                → a `link` grant (viewer).
* visibility='group' or edit_scope='group' on a plan with a group (team or
  organization) → a grant to that group: editor when edit_scope='group', else
  viewer.
* group_type='team'                  → group_id/group_name/group_slug are
  cleared: teams can't be attributed, their access is now the grant.
* group_type='organization'          → group_id/group_name/group_slug stay, now
  meaning the organization the plan is attributed to ("by Org X"). The
  attribution gives the organization no access by itself.

Dropped: visibility, edit_scope, group_type and ix_plans_group. Added:
ix_plans_group_id.

Downgrade is lossy. It restores the dropped columns on a best-effort basis:
* group_type='organization' wherever group_id is set.
* visibility='public' when the plan has a `link` grant, else 'group' when it
  has a grant to the attributed organization, else 'private'.
* edit_scope='group' when that organization grant is editor, else 'owner'.
* Grants to users, teams or other organizations are lost.

Revision ID: 024_plan_grants
Revises: 023_add_plan_owner_name
Create Date: 2026-11-16
"""

import sqlalchemy as sa

from alembic import op

revision = "024_plan_grants"
down_revision = "023_add_plan_owner_name"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "plan_grants",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column(
            "plan_id",
            sa.String(),
            sa.ForeignKey("plans.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("subject_type", sa.String(), nullable=False),
        sa.Column("subject_id", sa.String(), nullable=True),
        sa.Column("subject_name", sa.String(), nullable=True),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.String(), nullable=True),
        sa.UniqueConstraint(
            "plan_id", "subject_type", "subject_id", name="uq_plan_grants_plan_subject"
        ),
    )
    op.create_index("ix_plan_grants_plan_id", "plan_grants", ["plan_id"])
    op.create_index(
        "uq_plan_grants_plan_link",
        "plan_grants",
        ["plan_id"],
        unique=True,
        postgresql_where=sa.text("subject_type = 'link'"),
    )

    # Anyone with the link.
    op.execute(
        """
        INSERT INTO plan_grants
            (id, plan_id, subject_type, subject_id, subject_name, role, created_at, created_by)
        SELECT gen_random_uuid()::text, id, 'link', NULL, NULL, 'viewer', now(), owner_id
        FROM plans
        WHERE visibility = 'public'
        """
    )

    # Team and organization grants for the group's members.
    op.execute(
        """
        INSERT INTO plan_grants
            (id, plan_id, subject_type, subject_id, subject_name, role, created_at, created_by)
        SELECT gen_random_uuid()::text, id, group_type, group_id, group_name,
               CASE WHEN edit_scope = 'group' THEN 'editor' ELSE 'viewer' END,
               now(), owner_id
        FROM plans
        WHERE group_type IN ('team', 'organization')
          AND group_id IS NOT NULL
          AND (visibility = 'group' OR edit_scope = 'group')
        """
    )

    # Teams can't be attributed; their access now lives in the grant above.
    op.execute(
        """
        UPDATE plans
        SET group_id = NULL, group_name = NULL, group_slug = NULL
        WHERE group_type = 'team'
        """
    )

    op.drop_index("ix_plans_group", table_name="plans")
    op.drop_column("plans", "edit_scope")
    op.drop_column("plans", "group_type")
    op.drop_column("plans", "visibility")
    op.create_index("ix_plans_group_id", "plans", ["group_id"])


def downgrade() -> None:
    op.drop_index("ix_plans_group_id", table_name="plans")
    op.add_column(
        "plans",
        sa.Column("visibility", sa.String(), nullable=False, server_default="private"),
    )
    op.add_column("plans", sa.Column("group_type", sa.String(), nullable=True))
    op.add_column(
        "plans",
        sa.Column("edit_scope", sa.String(), nullable=False, server_default="owner"),
    )
    op.create_index("ix_plans_group", "plans", ["group_type", "group_id"])

    # The attributed organization becomes the plan's group; its own grant (if
    # any) sets the group's view/edit scope.
    op.execute(
        """
        UPDATE plans p
        SET group_type = 'organization',
            visibility = CASE WHEN g.role IS NOT NULL THEN 'group' ELSE 'private' END,
            edit_scope = CASE WHEN g.role = 'editor' THEN 'group' ELSE 'owner' END
        FROM plans p2
        LEFT JOIN plan_grants g
            ON g.plan_id = p2.id
           AND g.subject_type = 'organization'
           AND g.subject_id = p2.group_id
        WHERE p.id = p2.id AND p.group_id IS NOT NULL
        """
    )

    op.execute(
        """
        UPDATE plans
        SET visibility = 'public'
        WHERE id IN (SELECT plan_id FROM plan_grants WHERE subject_type = 'link')
        """
    )

    op.drop_index("uq_plan_grants_plan_link", table_name="plan_grants")
    op.drop_index("ix_plan_grants_plan_id", table_name="plan_grants")
    op.drop_table("plan_grants")
