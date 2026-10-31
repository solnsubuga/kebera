from app.worker.__main__ import build_scheduler, main
from app.worker.tasks import SCHEDULES, TASKS


def test_every_schedule_has_a_task() -> None:
    assert set(SCHEDULES) <= set(TASKS)


def test_schedules_only_when_enabled() -> None:
    off = build_scheduler(schedules_enabled=False)
    on = build_scheduler(schedules_enabled=True)
    # Jobs are pending until the scheduler starts; heartbeat is always there.
    assert [j.id for j in off.get_jobs()] == ["heartbeat"]
    assert {j.id for j in on.get_jobs()} == {"heartbeat", *SCHEDULES}


def test_run_once_rejects_unknown_tasks() -> None:
    assert main(["run-once", "nope"]) == 2
