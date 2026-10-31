from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import WorkerHeartbeat
from app.worker.heartbeat import WORKER_NAME, beat


def test_live(client: TestClient) -> None:
    assert client.get("/api/health/live").json() == {"status": "ok"}


def test_degraded_without_a_worker(client: TestClient) -> None:
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["database"] is True
    assert body["worker"] == {"ok": False, "seen_at": None}
    assert body["status"] == "degraded"


def test_ok_after_a_heartbeat(client: TestClient, session: Session) -> None:
    beat(session)
    beat(session)  # the second beat updates the same row
    body = client.get("/api/health").json()
    assert body["status"] == "ok"
    assert body["worker"]["ok"] is True


def test_stale_heartbeat_is_not_ok(client: TestClient, session: Session) -> None:
    session.add(WorkerHeartbeat(name=WORKER_NAME, seen_at=datetime.now(UTC) - timedelta(hours=1)))
    session.commit()
    assert client.get("/api/health").json()["worker"]["ok"] is False


def test_request_id_is_echoed(client: TestClient) -> None:
    assert client.get("/api/health/live", headers={"x-request-id": "abc"}).headers["x-request-id"] == "abc"
