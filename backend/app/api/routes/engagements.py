import uuid
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import DB
from app.models import Engagement, EngagementStatus
from app.schemas.engagement import EngagementCreate, EngagementOut, EngagementUpdate, Page
from app.services import engagements as svc

router = APIRouter(prefix="/engagements", tags=["engagements"])


def _get_or_404(session: DB, engagement_id: uuid.UUID) -> Engagement:
    engagement = svc.get_engagement(session, engagement_id)
    if engagement is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "engagement not found")
    return engagement


@router.get("", response_model=Page[EngagementOut])
def list_engagements(
    session: DB,
    status_: Annotated[EngagementStatus | None, Query(alias="status")] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[EngagementOut]:
    rows, total = svc.list_engagements(session, status=status_, limit=limit, offset=offset)
    return Page(
        items=[EngagementOut.model_validate(r) for r in rows], total=total, limit=limit, offset=offset
    )


@router.post("", response_model=EngagementOut, status_code=status.HTTP_201_CREATED)
def create_engagement(session: DB, body: EngagementCreate) -> Engagement:
    return svc.create_engagement(session, body)


@router.get("/{engagement_id}", response_model=EngagementOut)
def get_engagement(session: DB, engagement_id: uuid.UUID) -> Engagement:
    return _get_or_404(session, engagement_id)


@router.patch("/{engagement_id}", response_model=EngagementOut)
def update_engagement(session: DB, engagement_id: uuid.UUID, body: EngagementUpdate) -> Engagement:
    engagement = _get_or_404(session, engagement_id)
    try:
        return svc.update_engagement(session, engagement, body)
    except svc.InvalidTransition as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e
