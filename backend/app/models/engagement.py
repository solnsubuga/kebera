import enum
from datetime import date

from sqlalchemy import CheckConstraint, Date, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, Timestamps, UUIDPk


class Framework(enum.StrEnum):
    ifrs = "ifrs"
    ifrs_sme = "ifrs_sme"


class EngagementStatus(enum.StrEnum):
    """The audit's phases, in order: plan, test, close."""

    planning = "planning"
    fieldwork = "fieldwork"
    completion = "completion"
    signed = "signed"


class Engagement(UUIDPk, Timestamps, Base):
    """One audit of one client's financial statements for one period."""

    __tablename__ = "engagements"
    __table_args__ = (CheckConstraint("period_start < period_end", name="period_order"),)

    client_name: Mapped[str] = mapped_column(String(200))
    period_start: Mapped[date] = mapped_column(Date)
    period_end: Mapped[date] = mapped_column(Date, index=True)
    framework: Mapped[Framework] = mapped_column(
        Enum(Framework, name="framework", values_callable=lambda e: [m.value for m in e])
    )
    status: Mapped[EngagementStatus] = mapped_column(
        Enum(EngagementStatus, name="engagement_status", values_callable=lambda e: [m.value for m in e]),
        default=EngagementStatus.planning,
        index=True,
    )
