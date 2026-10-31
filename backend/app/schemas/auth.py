import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models import MemberRole


class EmailIn(BaseModel):
    email: str = Field(max_length=254)
    next: str | None = Field(default=None, max_length=300)  # where the web app goes after the link


class SignupIn(EmailIn):
    name: str | None = Field(default=None, max_length=120)
    firm_name: str = Field(min_length=1, max_length=200)


class VerifyIn(BaseModel):
    token: str = Field(max_length=200)


class PasswordStepIn(BaseModel):
    password: str = Field(max_length=500)


class PasswordChangeIn(BaseModel):
    current_password: str = Field(max_length=500)
    new_password: str = Field(max_length=500)


class SwitchFirmIn(BaseModel):
    firm_id: uuid.UUID


class Sent(BaseModel):
    sent: bool = True


class Options(BaseModel):
    signup: bool
    link_minutes: int


class FirmOut(BaseModel):
    id: uuid.UUID
    name: str
    role: MemberRole


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    name: str


class Me(BaseModel):
    user: UserOut
    firm: FirmOut | None  # the firm this session works in
    firms: list[FirmOut]  # every firm they belong to
    permissions: list[str]
    password_step: Literal["set", "enter"] | None  # a partner still owes their password this session


class Verified(BaseModel):
    token: str  # for scripts; the browser uses the cookie
    me: Me


class MemberIn(BaseModel):
    email: str = Field(max_length=254)
    name: str | None = Field(default=None, max_length=120)
    role: MemberRole


class MemberPatch(BaseModel):
    role: MemberRole | None = None
    is_active: bool | None = None
    send_link: bool = False  # email a sign-in link (the invitation again if they never signed in)
    clear_password: bool = False  # a partner's: they choose a new one after their next link


class MemberOut(BaseModel):
    id: uuid.UUID  # the membership
    user_id: uuid.UUID
    email: str
    name: str
    role: MemberRole
    is_active: bool
    confirmed: bool
    has_password: bool
    locked: bool
    created_at: datetime
    last_login_at: datetime | None
    link_sent: bool = False


class AuditEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    at: datetime
    actor_email: str | None
    action: str
    target: str | None
    detail: dict[str, str] | None
