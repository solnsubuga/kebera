import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import DB, require
from app.models import Engagement, EngagementStatus
from app.schemas.engagement import EngagementCreate, EngagementOut, EngagementUpdate, Page
from app.services import auth
from app.services import engagements as svc
from app.services.auth import Context

router = APIRouter(prefix="/engagements", tags=["engagements"])
Reader = Annotated[Context, Depends(require("engagements.read"))]
Writer = Annotated[Context, Depends(require("engagements.write"))]


def _get_or_404(session: Session, ctx: Context, engagement_id: uuid.UUID) -> Engagement:
    engagement = svc.get_engagement(session, ctx.firm_id, engagement_id)
    if engagement is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "engagement not found")
    return engagement


@router.get("", response_model=Page[EngagementOut])
def list_engagements(
    ctx: Reader,
    session: DB,
    status_: Annotated[EngagementStatus | None, Query(alias="status")] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[EngagementOut]:
    rows, total = svc.list_engagements(session, ctx.firm_id, status=status_, limit=limit, offset=offset)
    return Page(
        items=[EngagementOut.model_validate(r) for r in rows], total=total, limit=limit, offset=offset
    )


@router.post("", response_model=EngagementOut, status_code=status.HTTP_201_CREATED)
def create_engagement(ctx: Writer, session: DB, body: EngagementCreate) -> Engagement:
    engagement = svc.create_engagement(session, ctx.firm_id, body)
    auth.audit(
        session,
        firm_id=ctx.firm_id,
        actor=ctx.user,
        action="engagement.created",
        target=engagement.client_name,
    )
    session.commit()
    return engagement


@router.get("/{engagement_id}", response_model=EngagementOut)
def get_engagement(ctx: Reader, session: DB, engagement_id: uuid.UUID) -> Engagement:
    return _get_or_404(session, ctx, engagement_id)


@router.patch("/{engagement_id}", response_model=EngagementOut)
def update_engagement(
    ctx: Writer, session: DB, engagement_id: uuid.UUID, body: EngagementUpdate
) -> Engagement:
    engagement = _get_or_404(session, ctx, engagement_id)
    previous = engagement.status
    if body.status == EngagementStatus.signed and "engagements.sign" not in ctx.permissions:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "only a partner can sign an engagement")
    try:
        engagement = svc.update_engagement(session, engagement, body)
    except svc.InvalidTransition as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e
    if engagement.status != previous:
        auth.audit(
            session,
            firm_id=ctx.firm_id,
            actor=ctx.user,
            action="engagement.status_set",
            target=engagement.client_name,
            status=engagement.status,
            previous=previous,
        )
        session.commit()
    return engagement
