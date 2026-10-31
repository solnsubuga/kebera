from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Response
from sqlalchemy import select, text

from app import __version__
from app.api.deps import DB
from app.core.config import get_settings
from app.models import WorkerHeartbeat
from app.schemas.health import Health, WorkerStatus
from app.worker.heartbeat import WORKER_NAME

router = APIRouter(tags=["health"])


@router.get("/health/live")
def live() -> dict[str, str]:
    """The process is up. Used by Docker; it never touches the database."""
    return {"status": "ok"}


@router.get("/health", response_model=Health)
def health(session: DB, response: Response) -> Health:
    """Ready to serve: the database answers. Also says whether the worker has been seen lately."""
    try:
        session.execute(text("select 1"))
        db_ok = True
    except Exception:
        db_ok = False
    seen = None
    if db_ok:
        seen = session.scalar(select(WorkerHeartbeat.seen_at).where(WorkerHeartbeat.name == WORKER_NAME))
    stale = timedelta(seconds=get_settings().worker_stale_seconds)
    worker_ok = seen is not None and datetime.now(UTC) - seen < stale
    if not db_ok:
        response.status_code = 503
    return Health(
        status="ok" if db_ok and worker_ok else "degraded",
        database=db_ok,
        worker=WorkerStatus(ok=worker_ok, seen_at=seen),
        version=__version__,
    )
