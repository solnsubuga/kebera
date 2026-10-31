from fastapi.testclient import TestClient

ACME = {"client_name": "Acme Uganda Ltd", "period_start": "2025-07-01", "period_end": "2026-06-30"}


def create(client: TestClient, **over: str) -> dict:
    r = client.post("/api/engagements", json={**ACME, **over})
    assert r.status_code == 201, r.text
    return r.json()


def test_create_and_get(client: TestClient) -> None:
    e = create(client)
    assert e["status"] == "planning"
    assert e["framework"] == "ifrs"
    assert client.get(f"/api/engagements/{e['id']}").json() == e


def test_period_must_be_in_order(client: TestClient) -> None:
    r = client.post("/api/engagements", json={**ACME, "period_end": "2025-01-01"})
    assert r.status_code == 422


def test_list_is_paged_and_filtered(client: TestClient) -> None:
    create(client, client_name="A", period_end="2026-06-30")
    create(client, client_name="B", period_end="2026-12-31")
    page = client.get("/api/engagements", params={"limit": 1}).json()
    assert page["total"] == 2
    assert [e["client_name"] for e in page["items"]] == ["B"]  # latest period first
    assert client.get("/api/engagements", params={"status": "signed"}).json()["total"] == 0


def test_status_moves_one_phase_at_a_time(client: TestClient) -> None:
    e = create(client)
    url = f"/api/engagements/{e['id']}"
    assert client.patch(url, json={"status": "completion"}).status_code == 409
    assert client.patch(url, json={"status": "fieldwork"}).json()["status"] == "fieldwork"
    assert client.patch(url, json={"status": "planning"}).json()["status"] == "planning"


def test_signed_is_final(client: TestClient) -> None:
    e = create(client)
    url = f"/api/engagements/{e['id']}"
    for s in ("fieldwork", "completion", "signed"):
        assert client.patch(url, json={"status": s}).status_code == 200
    r = client.patch(url, json={"status": "completion"})
    assert r.status_code == 409


def test_unknown_engagement_is_404(client: TestClient) -> None:
    assert client.get("/api/engagements/00000000-0000-0000-0000-000000000000").status_code == 404
