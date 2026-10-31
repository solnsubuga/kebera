from fastapi.testclient import TestClient

from app.services import mailer
from tests.conftest import SignIn


def members(c: TestClient) -> dict[str, dict]:
    return {m["email"]: m for m in c.get("/api/members").json()}


def test_add_and_change_a_member(client: TestClient) -> None:
    r = client.post("/api/members", json={"email": "Kato@Firm-A.test", "name": "Kato", "role": "staff"})
    assert r.status_code == 201, r.text
    assert r.json()["email"] == "kato@firm-a.test"
    assert r.json()["link_sent"] is True
    assert mailer.OUTBOX[-1].to == "kato@firm-a.test"
    assert client.post("/api/members", json={"email": "kato@firm-a.test", "role": "staff"}).status_code == 409

    mid = r.json()["id"]
    assert client.patch(f"/api/members/{mid}", json={"role": "manager"}).json()["role"] == "manager"
    assert client.patch(f"/api/members/{mid}", json={"is_active": False}).json()["is_active"] is False
    assert client.patch(f"/api/members/{mid}", json={"send_link": True}).status_code == 409


def test_a_switched_off_member_is_signed_out_of_the_firm(sign_in: SignIn) -> None:
    partner = sign_in("p@a.test")
    staff = sign_in("s@a.test", "staff")
    assert staff.get("/api/engagements").status_code == 200
    partner.patch(f"/api/members/{members(partner)['s@a.test']['id']}", json={"is_active": False})
    assert staff.get("/api/engagements").status_code == 401


def test_a_firm_keeps_a_partner_and_nobody_demotes_themselves(sign_in: SignIn) -> None:
    p1 = sign_in("p1@a.test")
    me = members(p1)["p1@a.test"]["id"]
    assert p1.patch(f"/api/members/{me}", json={"role": "staff"}).status_code == 409
    assert p1.patch(f"/api/members/{me}", json={"is_active": False}).status_code == 409

    p2 = sign_in("p2@a.test")
    p2.patch(f"/api/members/{me}", json={"role": "manager"})
    # p2 is now the only partner, and cannot be demoted by anyone.
    other = members(p2)["p2@a.test"]["id"]
    assert p2.patch(f"/api/members/{other}", json={"role": "staff"}).status_code == 409


def test_promoting_to_partner_signs_them_out_until_they_have_a_password(sign_in: SignIn) -> None:
    partner = sign_in("p@a.test")
    manager = sign_in("m@a.test", "manager")
    partner.patch(f"/api/members/{members(partner)['m@a.test']['id']}", json={"role": "partner"})
    assert manager.get("/api/engagements").status_code == 401


def test_clear_password(sign_in: SignIn) -> None:
    p1 = sign_in("p1@a.test")
    p2 = sign_in("p2@a.test")
    r = p1.patch(f"/api/members/{members(p1)['p2@a.test']['id']}", json={"clear_password": True})
    assert r.json()["has_password"] is False
    assert p2.get("/api/auth/me").status_code == 401
