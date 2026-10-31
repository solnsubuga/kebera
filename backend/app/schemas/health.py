from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class WorkerStatus(BaseModel):
    ok: bool
    seen_at: datetime | None


class Health(BaseModel):
    status: Literal["ok", "degraded"]
    database: bool
    worker: WorkerStatus
    version: str
