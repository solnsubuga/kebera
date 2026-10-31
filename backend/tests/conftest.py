"""Tests run against a real Postgres (the same engine as production), migrated with Alembic rather than
create_all, so every test run also checks the migrations.

    KEBERA_TEST_DATABASE_URL=postgresql+psycopg://kebera:kebera@localhost:5432/kebera_test uv run pytest

The database named there is wiped at the start of the run.
"""

import os
from collections.abc import Callable, Iterator

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import Engine, text
from sqlalchemy.orm import Session

from app.core.db import get_session, make_engine
from app.main import app
from app.models import Firm, MemberRole, Membership
from app.services import auth, mailer

TEST_URL = os.environ.get(
    "KEBERA_TEST_DATABASE_URL", "postgresql+psycopg://kebera:kebera@localhost:5432/kebera_test"
)


def alembic_config(url: str) -> Config:
    cfg = Config("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", url)
    return cfg


@pytest.fixture(scope="session")
def engine() -> Engine:
    eng = make_engine(TEST_URL)
    with eng.begin() as conn:
        conn.execute(text("drop schema public cascade; create schema public"))
    command.upgrade(alembic_config(TEST_URL), "head")
    return eng


@pytest.fixture()
def session(engine: Engine) -> Iterator[Session]:
    """A session whose work is rolled back after the test, even the commits the app makes."""
    with engine.connect() as conn:
        outer = conn.begin()
        s = Session(bind=conn, join_transaction_mode="create_savepoint", expire_on_commit=False)
        try:
            yield s
        finally:
            s.close()
            outer.rollback()


@pytest.fixture()
def anon(session: Session) -> Iterator[TestClient]:
    """A client that is not signed in."""
    app.dependency_overrides[get_session] = lambda: session
    mailer.OUTBOX.clear()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


SignIn = Callable[..., TestClient]


@pytest.fixture()
def sign_in(session: Session, anon: TestClient) -> Iterator[SignIn]:
    """Makes clients signed in as a member of a firm (created if needed), skipping the emailed link:
    sign_in("a@x.com", "manager", firm="Firm A")."""
    clients: list[TestClient] = []
    firms: dict[str, Firm] = {}

    def make(email: str, role: str = "partner", firm: str = "Firm A") -> TestClient:
        if firm not in firms:
            firms[firm] = Firm(name=firm)
            session.add(firms[firm])
            session.flush()
        user = auth.get_or_create_user(session, email)
        user.password_hash = "set"  # a partner who has already entered their password
        session.add(Membership(firm_id=firms[firm].id, user_id=user.id, role=MemberRole(role)))
        token, _ = auth.start_session(session, user, firms[firm].id, password_pending=False)
        session.commit()
        c = TestClient(app, headers={"Authorization": f"Bearer {token}"})
        clients.append(c)
        return c

    yield make
    for c in clients:
        c.close()


@pytest.fixture()
def client(sign_in: SignIn) -> TestClient:
    """Signed in as a partner of "Firm A"."""
    return sign_in("partner@firm-a.test")
