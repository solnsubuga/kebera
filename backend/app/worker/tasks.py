"""Scheduled tasks. Each one is a plain function that opens its own session, so it can also be run by hand:

    python -m app.worker run-once <name>

Add a task here and give it a trigger in SCHEDULES. Tasks must be safe to run twice (the scheduler may
fire a missed run after a restart), so write them to be idempotent.
"""

from collections.abc import Callable

import structlog
from apscheduler.triggers.base import BaseTrigger
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import func, select

from app.core.db import SessionLocal
from app.models import Engagement, EngagementStatus

log = structlog.get_logger("kebera.tasks")


def open_engagements_report() -> None:
    """Logs a daily count of open engagements by phase. A placeholder for real work (PBC reminders)."""
    with SessionLocal() as session:
        rows = session.execute(
            select(Engagement.status, func.count())
            .where(Engagement.status != EngagementStatus.signed)
            .group_by(Engagement.status)
        ).all()
    log.info("open_engagements", **{str(s): n for s, n in rows})


TASKS: dict[str, Callable[[], None]] = {
    "open-engagements-report": open_engagements_report,
}

SCHEDULES: dict[str, BaseTrigger] = {
    "open-engagements-report": CronTrigger(hour=6, minute=0, timezone="UTC"),
}
