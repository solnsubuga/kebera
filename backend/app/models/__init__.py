"""Importing this package registers every table on Base.metadata (Alembic relies on it)."""

from app.models.auth import AuditEvent, AuthSession, LinkPurpose, LoginLink
from app.models.base import Base
from app.models.engagement import Engagement, EngagementStatus, Framework
from app.models.firm import Firm, MemberRole, Membership, User
from app.models.worker import WorkerHeartbeat

__all__ = [
    "AuditEvent",
    "AuthSession",
    "Base",
    "Engagement",
    "EngagementStatus",
    "Firm",
    "Framework",
    "LinkPurpose",
    "LoginLink",
    "MemberRole",
    "Membership",
    "User",
    "WorkerHeartbeat",
]
