"""Sign-in through the API, as the web app does it: email a link, open it, (partners) enter a password."""

from urllib.parse import parse_qs, urlparse

from fastapi.testclient import TestClient

from app.services import mailer
from tests.conftest import SignIn


def last_token(to: str) -> str:
    mail = next(m for m in reversed(mailer.OUTBOX) if m.to == to)
    return parse_qs(urlparse(mail.url).query)["token"][0]


def signup(anon: TestClient, email: str = "ama@mukasa.test", firm: str = "Mukasa & Co") -> None:
    r = anon.post("/api/auth/signup", json={"email": email, "name": "Ama", "firm_name": firm})
    assert r.status_code == 202, r.text


def test_signup_opens_a_firm_and_the_partner_chooses_a_password(anon: TestClient) -> None:
    signup(anon)
    assert mailer.OUTBOX[-1].subject == "Confirm your email for Kebera"
    r = anon.post("/api/auth/verify", json={"token": last_token("ama@mukasa.test")})
    assert r.status_code == 200, r.text
    me = r.json()["me"]
    assert me["firm"]["name"] == "Mukasa & Co"
    assert me["firm"]["role"] == "partner"
    assert me["password_step"] == "set"
    assert me["permissions"] == []
    # The cookie is set, but grants nothing until the password.
    assert anon.get("/api/engagements").status_code == 403

    assert anon.post("/api/auth/password", json={"password": "short"}).status_code == 422
    r = anon.post("/api/auth/password", json={"password": "a long enough password"})
    assert r.status_code == 200, r.text
    assert r.json()["password_step"] is None
    assert "members.manage" in r.json()["permissions"]
    assert anon.get("/api/engagements").json()["total"] == 0


def test_partner_enters_their_password_on_later_sign_ins(anon: TestClient) -> None:
    signup(anon)
    anon.post("/api/auth/verify", json={"token": last_token("ama@mukasa.test")})
    anon.post("/api/auth/password", json={"password": "a long enough password"})
    anon.post("/api/auth/logout")
    assert anon.get("/api/auth/me").status_code == 401

    anon.post("/api/auth/link", json={"email": "AMA@mukasa.test "})
    assert mailer.OUTBOX[-1].subject == "Sign in to Kebera"
    me = anon.post("/api/auth/verify", json={"token": last_token("ama@mukasa.test")}).json()["me"]
    assert me["password_step"] == "enter"
    assert anon.post("/api/auth/password", json={"password": "wrong password!!"}).status_code == 401
    assert anon.post("/api/auth/password", json={"password": "a long enough password"}).status_code == 200


def test_five_wrong_passwords_lock_the_account(anon: TestClient) -> None:
    signup(anon)
    anon.post("/api/auth/verify", json={"token": last_token("ama@mukasa.test")})
    anon.post("/api/auth/password", json={"password": "a long enough password"})
    anon.post("/api/auth/logout")
    anon.post("/api/auth/link", json={"email": "ama@mukasa.test"})
    anon.post("/api/auth/verify", json={"token": last_token("ama@mukasa.test")})
    for _ in range(5):
        assert anon.post("/api/auth/password", json={"password": "wrong password!!"}).status_code == 401
    # The fifth signed the session out; a new link and the right password still fail while locked.
    assert anon.get("/api/auth/me").status_code == 401
    anon.post("/api/auth/link", json={"email": "ama@mukasa.test"})
    anon.post("/api/auth/verify", json={"token": last_token("ama@mukasa.test")})
    assert anon.post("/api/auth/password", json={"password": "a long enough password"}).status_code == 401


def test_a_link_works_once(anon: TestClient) -> None:
    signup(anon)
    token = last_token("ama@mukasa.test")
    assert anon.post("/api/auth/verify", json={"token": token}).status_code == 200
    assert anon.post("/api/auth/verify", json={"token": token}).status_code == 401
    assert anon.post("/api/auth/verify", json={"token": "made-up"}).status_code == 401


def test_link_and_signup_never_say_who_has_an_account(anon: TestClient) -> None:
    r = anon.post("/api/auth/link", json={"email": "nobody@nowhere.test"})
    assert (r.status_code, r.json()) == (202, {"sent": True})
    assert mailer.OUTBOX == []
    signup(anon)
    signup(anon, firm="Another firm")  # the address has an account: a sign-in link, no second firm
    assert [m.subject for m in mailer.OUTBOX] == ["Confirm your email for Kebera"] * 2
    assert anon.post("/api/auth/link", json={"email": "not an email"}).status_code == 422


def test_links_are_rate_limited(anon: TestClient) -> None:
    signup(anon)
    for _ in range(10):
        anon.post("/api/auth/link", json={"email": "ama@mukasa.test"})
    assert len(mailer.OUTBOX) == 5


def test_staff_sign_in_without_a_password(anon: TestClient, client: TestClient) -> None:
    r = client.post("/api/members", json={"email": "kato@firm-a.test", "role": "staff"})
    assert r.status_code == 201, r.text
    assert "invited to Firm A" in mailer.OUTBOX[-1].subject
    me = anon.post("/api/auth/verify", json={"token": last_token("kato@firm-a.test")}).json()["me"]
    assert me["password_step"] is None
    assert me["permissions"] == ["engagements.read"]
    assert anon.get("/api/auth/me").json()["user"]["email"] == "kato@firm-a.test"


def test_switching_firms(sign_in: SignIn) -> None:
    a = sign_in("both@x.test", "manager", firm="Firm A")
    sign_in("both@x.test", "staff", firm="Firm B")
    me = a.get("/api/auth/me").json()
    assert me["firm"]["name"] == "Firm A"
    assert sorted(f["name"] for f in me["firms"]) == ["Firm A", "Firm B"]
    a.post(
        "/api/engagements",
        json={"client_name": "Only in A", "period_start": "2025-01-01", "period_end": "2025-12-31"},
    )
    firm_b = next(f["id"] for f in me["firms"] if f["name"] == "Firm B")
    me = a.post("/api/auth/firm", json={"firm_id": firm_b}).json()
    assert me["firm"]["role"] == "staff"
    assert a.get("/api/engagements").json()["total"] == 0
    other = "00000000-0000-0000-0000-000000000000"
    assert a.post("/api/auth/firm", json={"firm_id": other}).status_code == 404


def test_signup_can_be_closed(anon: TestClient, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    from app.core.config import get_settings

    monkeypatch.setattr(get_settings(), "signup_open", False)
    assert anon.get("/api/auth/options").json()["signup"] is False
    r = anon.post("/api/auth/signup", json={"email": "x@y.test", "firm_name": "X"})
    assert r.status_code == 403


def test_cookie_is_http_only(anon: TestClient) -> None:
    signup(anon)
    r = anon.post("/api/auth/verify", json={"token": last_token("ama@mukasa.test")})
    cookie = r.headers["set-cookie"]
    assert "kebera_session=" in cookie
    assert "HttpOnly" in cookie
    assert "samesite=lax" in cookie.lower()
