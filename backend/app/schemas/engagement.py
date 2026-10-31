import uuid
from datetime import date, datetime
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models import EngagementStatus, Framework


class EngagementBase(BaseModel):
    client_name: str = Field(min_length=1, max_length=200)
    period_start: date
    period_end: date
    framework: Framework = Framework.ifrs

    @model_validator(mode="after")
    def _period(self) -> Self:
        if self.period_start >= self.period_end:
            raise ValueError("period_start must be before period_end")
        return self


class EngagementCreate(EngagementBase):
    pass


class EngagementUpdate(BaseModel):
    """Only the fields that can change after an engagement is opened."""

    client_name: str | None = Field(default=None, min_length=1, max_length=200)
    status: EngagementStatus | None = None


class EngagementOut(EngagementBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: EngagementStatus
    created_at: datetime
    updated_at: datetime


class Page[T](BaseModel):
    items: list[T]
    total: int
    limit: int
    offset: int
