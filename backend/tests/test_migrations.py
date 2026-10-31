from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.runtime.migration import MigrationContext
from sqlalchemy import Engine

from app.models import Base
from tests.conftest import TEST_URL, alembic_config


def test_models_match_migrations(engine: Engine) -> None:
    """A model change without a migration fails here: run `make migration m="..."`."""
    with engine.connect() as conn:
        ctx = MigrationContext.configure(conn, opts={"compare_type": True})
        diff = [d for d in compare_metadata(ctx, Base.metadata) if "apscheduler_jobs" not in str(d)]
    assert diff == []


def test_downgrade_and_upgrade_again(engine: Engine) -> None:
    cfg = alembic_config(TEST_URL)
    command.downgrade(cfg, "base")
    command.upgrade(cfg, "head")
