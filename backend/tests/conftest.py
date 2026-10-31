"""Tests run against a real Postgres (the same engine as production), migrated with Alembic rather than
create_all, so every test run also checks the migrations.

    KEBERA_TEST_DATABASE_URL=postgresql+psycopg://kebera:kebera@localhost:5432/kebera_test uv run pytest

The database named there is wiped at the start of the run.
"""

import os
from collections.abc import Iterator

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import Engine, text
from sqlalchemy.orm import Session

from app.core.db import get_session, make_engine
from app.main import app

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
def client(session: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_session] = lambda: session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
