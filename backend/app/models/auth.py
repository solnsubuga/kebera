import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, Boolean, DateTime, Enum, ForeignKey, Identity, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPk


class LinkPurpose(enum.StrEnum):
    login = "login"
    confirm = "confirm"  # the first link to a new address; opening it confirms the address too
    invite = "invite"  # sent when a partner adds someone


class AuthSession(UUIDPk, Base):
    """A signed-in browser or script. Only the SHA-256 of its token is stored."""

    __tablename__ = "auth_sessions"

    token_sha256: Mapped[str] = mapped_column(String(64), unique=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    # The firm this session is working in; every engagement query is scoped to it.
    firm_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("firms.id", ondelete="SET NULL"), index=True)
    # A partner's session after the link and before their password: it grants nothing.
    password_pending: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class LoginLink(UUIDPk, Base):
    """A one-use link emailed to sign in. Only the SHA-256 of its token is stored."""

    __tablename__ = "login_links"

    token_sha256: Mapped[str] = mapped_column(String(64), unique=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    # The firm to open after signing in (an invitation's firm); null means their usual one.
    firm_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("firms.id", ondelete="CASCADE"))
    purpose: Mapped[LinkPurpose] = mapped_column(
        Enum(LinkPurpose, name="link_purpose", values_callable=lambda e: [m.value for m in e])
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class AuditEvent(Base):
    """Who did what: sign-ins, people and roles, and changes to engagements."""

    __tablename__ = "audit_events"
    __table_args__ = (Index("ix_audit_events_firm_id_id", "firm_id", "id"),)

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # Null for events that belong to no firm (a sign-in before a firm is chosen).
    firm_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("firms.id", ondelete="CASCADE"))
    actor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    actor_email: Mapped[str | None] = mapped_column(String(254))
    action: Mapped[str] = mapped_column(String(60))
    target: Mapped[str | None] = mapped_column(String(254))
    detail: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
