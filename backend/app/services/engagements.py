"""Engagement queries and changes. Routes stay thin; the rules live here."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Engagement, EngagementStatus
from app.schemas.engagement import EngagementCreate, EngagementUpdate

ORDER = list(EngagementStatus)


class InvalidTransition(ValueError):
    pass


def list_engagements(
    session: Session, *, status: EngagementStatus | None, limit: int, offset: int
) -> tuple[list[Engagement], int]:
    query = select(Engagement)
    if status is not None:
        query = query.where(Engagement.status == status)
    total = session.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = session.scalars(
        query.order_by(Engagement.period_end.desc(), Engagement.id).limit(limit).offset(offset)
    ).all()
    return list(rows), total


def get_engagement(session: Session, engagement_id: uuid.UUID) -> Engagement | None:
    return session.get(Engagement, engagement_id)


def create_engagement(session: Session, data: EngagementCreate) -> Engagement:
    engagement = Engagement(**data.model_dump())
    session.add(engagement)
    session.commit()
    return engagement


def update_engagement(session: Session, engagement: Engagement, data: EngagementUpdate) -> Engagement:
    if data.status is not None and data.status != engagement.status:
        # Phases move forward one step at a time, or back one step (to reopen work); never skip.
        if abs(ORDER.index(data.status) - ORDER.index(engagement.status)) != 1:
            raise InvalidTransition(f"cannot move from {engagement.status} to {data.status}")
        if engagement.status == EngagementStatus.signed:
            raise InvalidTransition("a signed engagement is closed")
        engagement.status = data.status
    if data.client_name is not None:
        engagement.client_name = data.client_name
    session.commit()
    session.refresh(engagement)
    return engagement
