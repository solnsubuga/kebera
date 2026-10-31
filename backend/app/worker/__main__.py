"""The background worker: one process that owns the schedules.

    python -m app.worker                      # run the scheduler (exactly one per deployment)
    python -m app.worker run-once <task>      # run one task now and exit

The API never runs scheduled work itself, so scaling the API never runs a job twice. The schedules live in
Postgres (APScheduler's apscheduler_jobs table), so they survive restarts, and they only run when
KEBERA_SCHEDULES_ENABLED is on. A heartbeat is written every minute either way, for /api/health.
"""

import signal
import sys
from types import FrameType

import structlog
from apscheduler.executors.pool import ThreadPoolExecutor
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import get_settings
from app.core.db import SessionLocal, engine
from app.core.logging import configure_logging
from app.worker.heartbeat import beat
from app.worker.tasks import SCHEDULES, TASKS

log = structlog.get_logger("kebera.worker")


def heartbeat() -> None:
    with SessionLocal() as session:
        beat(session)


def build_scheduler(schedules_enabled: bool) -> BlockingScheduler:
    scheduler = BlockingScheduler(
        jobstores={"default": SQLAlchemyJobStore(engine=engine), "memory": MemoryJobStore()},
        executors={"default": ThreadPoolExecutor(4)},
        job_defaults={"coalesce": True, "max_instances": 1, "misfire_grace_time": 3600},
        timezone="UTC",
    )
    scheduler.add_job(heartbeat, IntervalTrigger(seconds=60), id="heartbeat", jobstore="memory")
    if schedules_enabled:
        for name, trigger in SCHEDULES.items():
            # replace_existing keeps the stored schedule in step with the code on every start.
            scheduler.add_job(
                f"app.worker.tasks:{TASKS[name].__name__}", trigger, id=name, name=name, replace_existing=True
            )
    else:
        log.info("schedules_disabled", hint="set KEBERA_SCHEDULES_ENABLED=1 to run them")
    return scheduler


def main(argv: list[str]) -> int:
    configure_logging()
    if len(argv) == 2 and argv[0] == "run-once":
        if argv[1] not in TASKS:
            print(f"unknown task {argv[1]!r}; known: {', '.join(TASKS)}", file=sys.stderr)
            return 2
        TASKS[argv[1]]()
        return 0
    if argv:
        print(__doc__, file=sys.stderr)
        return 2

    settings = get_settings()
    scheduler = build_scheduler(settings.schedules_enabled)

    def stop(signum: int, _frame: FrameType | None) -> None:
        log.info("worker_stopping", signal=signum)
        scheduler.shutdown(wait=True)

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    heartbeat()
    log.info("worker_started", schedules=list(SCHEDULES) if settings.schedules_enabled else [])
    scheduler.start()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
