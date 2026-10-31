"""engagements and worker heartbeats

Revision ID: 0001
Revises:
Create Date: 2026-10-31
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "engagements",
        sa.Column("client_name", sa.String(length=200), nullable=False),
        sa.Column("period_start", sa.Date(), nullable=False),
        sa.Column("period_end", sa.Date(), nullable=False),
        sa.Column("framework", sa.Enum("ifrs", "ifrs_sme", name="framework"), nullable=False),
        sa.Column(
            "status",
            sa.Enum("planning", "fieldwork", "completion", "signed", name="engagement_status"),
            nullable=False,
        ),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("period_start < period_end", name=op.f("ck_engagements_period_order")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_engagements")),
    )
    op.create_index(op.f("ix_engagements_period_end"), "engagements", ["period_end"], unique=False)
    op.create_index(op.f("ix_engagements_status"), "engagements", ["status"], unique=False)
    op.create_table(
        "worker_heartbeats",
        sa.Column("name", sa.String(length=64), nullable=False),
        sa.Column("seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("name", name=op.f("pk_worker_heartbeats")),
    )


def downgrade() -> None:
    op.drop_table("worker_heartbeats")
    op.drop_index(op.f("ix_engagements_status"), table_name="engagements")
    op.drop_index(op.f("ix_engagements_period_end"), table_name="engagements")
    op.drop_table("engagements")
    sa.Enum(name="engagement_status").drop(op.get_bind())
    sa.Enum(name="framework").drop(op.get_bind())
