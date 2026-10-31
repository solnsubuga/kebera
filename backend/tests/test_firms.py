"""Each firm sees only its own engagements, and roles limit what members may do."""

from fastapi.testclient import TestClient

from tests.conftest import SignIn

ACME = {"client_name": "Acme Uganda Ltd", "period_start": "2025-07-01", "period_end": "2026-06-30"}


def test_everything_needs_sign_in(anon: TestClient) -> None:
    assert anon.get("/api/engagements").status_code == 401
    assert anon.post("/api/engagements", json=ACME).status_code == 401
    assert anon.get("/api/members").status_code == 401
    assert anon.get("/api/engagements", headers={"Authorization": "Bearer nonsense"}).status_code == 401
    assert anon.get("/api/health/live").status_code == 200


def test_a_firm_never_sees_another_firms_engagements(sign_in: SignIn) -> None:
    a = sign_in("p@a.test", firm="Firm A")
    b = sign_in("p@b.test", firm="Firm B")
    e = a.post("/api/engagements", json=ACME).json()
    url = f"/api/engagements/{e['id']}"

    assert b.get("/api/engagements").json()["total"] == 0
    # Another firm's engagement looks exactly like one that does not exist.
    assert b.get(url).status_code == 404
    assert b.patch(url, json={"client_name": "Hijacked"}).status_code == 404
    assert b.patch(url, json={"status": "fieldwork"}).status_code == 404
    assert a.get(url).json()["client_name"] == "Acme Uganda Ltd"
    assert a.get(url).json()["status"] == "planning"


def test_a_firm_never_sees_another_firms_members_or_audit(sign_in: SignIn) -> None:
    a = sign_in("p@a.test", firm="Firm A")
    b = sign_in("p@b.test", firm="Firm B")
    a.post("/api/engagements", json=ACME)
    assert [m["email"] for m in b.get("/api/members").json()] == ["p@b.test"]
    assert b.get("/api/audit").json() == []
    a_member = a.get("/api/members").json()[0]["id"]
    assert b.patch(f"/api/members/{a_member}", json={"role": "staff"}).status_code == 404


def test_staff_read_only(sign_in: SignIn) -> None:
    partner = sign_in("p@a.test")
    staff = sign_in("s@a.test", "staff")
    e = partner.post("/api/engagements", json=ACME).json()
    assert staff.get(f"/api/engagements/{e['id']}").status_code == 200
    assert staff.post("/api/engagements", json=ACME).status_code == 403
    assert staff.patch(f"/api/engagements/{e['id']}", json={"status": "fieldwork"}).status_code == 403
    assert staff.get("/api/members").status_code == 403
    assert staff.get("/api/audit").status_code == 403


def test_only_a_partner_signs(sign_in: SignIn) -> None:
    partner = sign_in("p@a.test")
    manager = sign_in("m@a.test", "manager")
    e = manager.post("/api/engagements", json=ACME).json()
    url = f"/api/engagements/{e['id']}"
    for s in ("fieldwork", "completion"):
        assert manager.patch(url, json={"status": s}).status_code == 200
    r = manager.patch(url, json={"status": "signed"})
    assert r.status_code == 403
    assert "partner" in r.json()["detail"]
    assert partner.patch(url, json={"status": "signed"}).json()["status"] == "signed"


def test_changes_are_in_the_audit_trail(client: TestClient) -> None:
    e = client.post("/api/engagements", json=ACME).json()
    client.patch(f"/api/engagements/{e['id']}", json={"status": "fieldwork"})
    events = client.get("/api/audit").json()
    assert [ev["action"] for ev in events] == ["engagement.status_set", "engagement.created"]
    assert events[0]["detail"] == {"status": "fieldwork", "previous": "planning"}
    assert events[0]["actor_email"] == "partner@firm-a.test"
