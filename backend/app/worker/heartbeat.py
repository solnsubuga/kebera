from datetime import UTC, datetime

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models import WorkerHeartbeat

WORKER_NAME = "worker"


def beat(session: Session, name: str = WORKER_NAME) -> None:
    now = datetime.now(UTC)
    stmt = insert(WorkerHeartbeat).values(name=name, seen_at=now)
    session.execute(stmt.on_conflict_do_update(index_elements=[WorkerHeartbeat.name], set_={"seen_at": now}))
    session.commit()
