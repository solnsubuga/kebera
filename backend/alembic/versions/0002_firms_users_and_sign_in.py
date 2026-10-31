"""firms, users and sign-in

Every engagement now belongs to a firm. Engagements made before this migration are moved to a firm named
"Engagements from before sign-in"; give someone access with
`python -m app.cli add-member <firm id> you@example.com partner`.

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-31
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: str | Sequence[str] | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "firms",
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_firms")),
    )
    op.create_table(
        "users",
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("email_confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("password_hash", sa.String(length=200), nullable=True),
        sa.Column("failed_logins", sa.Integer(), server_default="0", nullable=False),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("email = lower(email)", name=op.f("ck_users_email_lowercase")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )
    op.create_table(
        "audit_events",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column("at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("firm_id", sa.Uuid(), nullable=True),
        sa.Column("actor_id", sa.Uuid(), nullable=True),
        sa.Column("actor_email", sa.String(length=254), nullable=True),
        sa.Column("action", sa.String(length=60), nullable=False),
        sa.Column("target", sa.String(length=254), nullable=True),
        sa.Column("detail", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(
            ["actor_id"], ["users.id"], name=op.f("fk_audit_events_actor_id_users"), ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["firm_id"], ["firms.id"], name=op.f("fk_audit_events_firm_id_firms"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_audit_events")),
    )
    op.create_index("ix_audit_events_firm_id_id", "audit_events", ["firm_id", "id"], unique=False)
    op.create_table(
        "auth_sessions",
        sa.Column("token_sha256", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("firm_id", sa.Uuid(), nullable=True),
        sa.Column("password_pending", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(
            ["firm_id"], ["firms.id"], name=op.f("fk_auth_sessions_firm_id_firms"), ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_auth_sessions_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_auth_sessions")),
        sa.UniqueConstraint("token_sha256", name=op.f("uq_auth_sessions_token_sha256")),
    )
    op.create_index(op.f("ix_auth_sessions_firm_id"), "auth_sessions", ["firm_id"], unique=False)
    op.create_index(op.f("ix_auth_sessions_user_id"), "auth_sessions", ["user_id"], unique=False)
    op.create_table(
        "login_links",
        sa.Column("token_sha256", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("firm_id", sa.Uuid(), nullable=True),
        sa.Column("purpose", sa.Enum("login", "confirm", "invite", name="link_purpose"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(
            ["firm_id"], ["firms.id"], name=op.f("fk_login_links_firm_id_firms"), ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_login_links_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_login_links")),
        sa.UniqueConstraint("token_sha256", name=op.f("uq_login_links_token_sha256")),
    )
    op.create_index(op.f("ix_login_links_user_id"), "login_links", ["user_id"], unique=False)
    op.create_table(
        "memberships",
        sa.Column("firm_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("role", sa.Enum("partner", "manager", "staff", name="member_role"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["firm_id"], ["firms.id"], name=op.f("fk_memberships_firm_id_firms"), ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_memberships_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_memberships")),
        sa.UniqueConstraint("firm_id", "user_id", name=op.f("uq_memberships_firm_id")),
    )
    op.create_index(op.f("ix_memberships_user_id"), "memberships", ["user_id"], unique=False)
    # Added empty, filled for any existing rows, then required.
    op.add_column("engagements", sa.Column("firm_id", sa.Uuid(), nullable=True))
    op.execute(
        """
        with legacy as (
            insert into firms (id, name)
            select gen_random_uuid(), 'Engagements from before sign-in'
            where exists (select 1 from engagements)
            returning id
        )
        update engagements set firm_id = (select id from legacy)
        """
    )
    op.alter_column("engagements", "firm_id", nullable=False)
    op.create_index(op.f("ix_engagements_firm_id"), "engagements", ["firm_id"], unique=False)
    op.create_foreign_key(
        op.f("fk_engagements_firm_id_firms"), "engagements", "firms", ["firm_id"], ["id"], ondelete="RESTRICT"
    )


def downgrade() -> None:
    op.drop_constraint(op.f("fk_engagements_firm_id_firms"), "engagements", type_="foreignkey")
    op.drop_index(op.f("ix_engagements_firm_id"), table_name="engagements")
    op.drop_column("engagements", "firm_id")
    op.drop_index(op.f("ix_memberships_user_id"), table_name="memberships")
    op.drop_table("memberships")
    op.drop_index(op.f("ix_login_links_user_id"), table_name="login_links")
    op.drop_table("login_links")
    op.drop_index(op.f("ix_auth_sessions_user_id"), table_name="auth_sessions")
    op.drop_index(op.f("ix_auth_sessions_firm_id"), table_name="auth_sessions")
    op.drop_table("auth_sessions")
    op.drop_index("ix_audit_events_firm_id_id", table_name="audit_events")
    op.drop_table("audit_events")
    op.drop_table("users")
    op.drop_table("firms")
    sa.Enum(name="member_role").drop(op.get_bind())
    sa.Enum(name="link_purpose").drop(op.get_bind())
