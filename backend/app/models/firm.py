import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, Timestamps, UUIDPk


class MemberRole(enum.StrEnum):
    """A person's role in one firm. What each may do is in app/services/auth.py (ROLE_PERMISSIONS)."""

    partner = "partner"
    manager = "manager"
    staff = "staff"


class Firm(UUIDPk, Timestamps, Base):
    """An audit firm: the tenant. Every engagement belongs to one firm, and only its members see it."""

    __tablename__ = "firms"

    name: Mapped[str] = mapped_column(String(200))


class User(UUIDPk, Timestamps, Base):
    """A person who can sign in. They may belong to more than one firm (see Membership)."""

    __tablename__ = "users"
    __table_args__ = (CheckConstraint("email = lower(email)", name="email_lowercase"),)

    email: Mapped[str] = mapped_column(String(254), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    # Set when they first open an emailed link.
    email_confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Only partners have one; null until they choose it after their first link.
    password_hash: Mapped[str | None] = mapped_column(String(200))
    failed_logins: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Membership(UUIDPk, Timestamps, Base):
    """A person's place in a firm, with their role there."""

    __tablename__ = "memberships"
    __table_args__ = (UniqueConstraint("firm_id", "user_id"),)

    firm_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("firms.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[MemberRole] = mapped_column(
        Enum(MemberRole, name="member_role", values_callable=lambda e: [m.value for m in e])
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
