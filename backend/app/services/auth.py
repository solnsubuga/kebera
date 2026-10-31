"""Sign-in, firms, roles and permissions. Adapted from laba's sign-in.

A firm is the tenant: every engagement belongs to one firm, and a session works in one firm at a time, so
every query is filtered on the session's firm. A person can belong to several firms (one Membership each) and
switch between them.

Permissions are checked by name, so routes never test roles directly:

    staff     engagements.read
    manager   staff's, plus engagements.write (open engagements, move them between phases)
    partner   manager's, plus engagements.sign, members.manage, audit.read

Nobody has a password except partners. Signing up, and every sign-in, emails a one-use link; opening it
signs the browser in, and the first link also confirms the address. A partner then enters their password too
(choosing one the first time); until they do, the session grants nothing. Five wrong passwords lock the
account for 15 minutes.

Sessions and links are random tokens; only their SHA-256 is stored. A session is an HttpOnly cookie (the
web app) or `Authorization: Bearer <token>` (scripts). Changes to people and roles go to audit_events.
"""

import re
import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from typing import Any, Literal
from urllib.parse import quote

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import get_settings
from app.models import AuditEvent, AuthSession, Firm, LinkPurpose, LoginLink, MemberRole, Membership, User
from app.services.mailer import Mail

ROLE_PERMISSIONS: dict[MemberRole, frozenset[str]] = {
    MemberRole.staff: frozenset({"engagements.read"}),
    MemberRole.manager: frozenset({"engagements.read", "engagements.write"}),
    MemberRole.partner: frozenset(
        {"engagements.read", "engagements.write", "engagements.sign", "members.manage", "audit.read"}
    ),
}
PASSWORD_ROLES = frozenset({MemberRole.partner})  # roles that enter a password after the link

CONFIRM_HOURS = 24  # the first link to a new sign-up
INVITE_HOURS = 72  # the link in an invitation
PASSWORD_STEP_MINUTES = 15  # how long a partner has to enter their password after the link
LINKS_PER_HOUR = 5  # per person; more requests are answered the same way but send nothing
MAX_FAILED_LOGINS = 5
LOCK_MINUTES = 15
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
NEXT_RE = re.compile(r"/[\w\-./?=&%]*")


class AuthError(ValueError):
    pass


def utcnow() -> datetime:
    return datetime.now(UTC)


def norm_email(email: str) -> str:
    e = (email or "").strip().lower()
    if len(e) > 254 or not EMAIL_RE.fullmatch(e):
        raise AuthError("not a valid email address")
    return e


def audit(
    session: Session,
    *,
    firm_id: uuid.UUID | None,
    actor: User | None,
    action: str,
    target: str | None = None,
    **detail: Any,
) -> None:
    session.add(
        AuditEvent(
            firm_id=firm_id,
            actor_id=actor.id if actor else None,
            actor_email=actor.email if actor else None,
            action=action,
            target=target,
            detail={k: str(v) for k, v in detail.items()} or None,
        )
    )


# ---------- people and firms ----------


def find_user(session: Session, email: str) -> User | None:
    try:
        email = norm_email(email)
    except AuthError:
        return None
    return session.scalar(select(User).where(User.email == email))


def get_or_create_user(session: Session, email: str, name: str | None = None) -> User:
    email = norm_email(email)
    user = session.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(email=email, name=((name or "").strip() or email.split("@")[0])[:120])
        session.add(user)
        session.flush()
    return user


def create_firm(session: Session, name: str, partner: User) -> Firm:
    """A new firm with `partner` as its first partner. The caller commits."""
    firm = Firm(name=name.strip()[:200])
    session.add(firm)
    session.flush()
    session.add(Membership(firm_id=firm.id, user_id=partner.id, role=MemberRole.partner))
    return firm


def active_memberships(session: Session, user: User) -> list[tuple[Membership, Firm]]:
    rows = session.execute(
        select(Membership, Firm)
        .join(Firm, Firm.id == Membership.firm_id)
        .where(Membership.user_id == user.id, Membership.is_active.is_(True))
        .order_by(Membership.created_at, Firm.name)
    ).all()
    return [(m, f) for m, f in rows]


def needs_password_role(session: Session, user: User) -> bool:
    """A partner in any firm enters a password after the link."""
    return any(m.role in PASSWORD_ROLES for m, _ in active_memberships(session, user))


def active_partners(session: Session, firm_id: uuid.UUID) -> int:
    return (
        session.scalar(
            select(func.count())
            .select_from(Membership)
            .join(User, User.id == Membership.user_id)
            .where(
                Membership.firm_id == firm_id,
                Membership.role == MemberRole.partner,
                Membership.is_active.is_(True),
                User.is_active.is_(True),
            )
        )
        or 0
    )


# ---------- emailed links ----------


def link_url(token: str, next_path: str | None = None) -> str:
    """The web app's page that opens a link; `next_path` is where to go after (a path inside the app)."""
    url = f"{get_settings().public_url.rstrip('/')}/auth/verify?token={token}"
    if next_path and NEXT_RE.fullmatch(next_path) and not next_path.startswith("//"):
        url += f"&next={quote(next_path, safe='')}"
    return url


def new_link(
    session: Session, user: User, purpose: LinkPurpose, firm_id: uuid.UUID | None, hours: float
) -> str | None:
    """A one-use link token for `user`, or None when they have asked for too many this hour."""
    recent = session.scalar(
        select(func.count())
        .select_from(LoginLink)
        .where(LoginLink.user_id == user.id, LoginLink.created_at > utcnow() - timedelta(hours=1))
    )
    if (recent or 0) >= LINKS_PER_HOUR:
        return None
    token = security.new_token()
    session.add(
        LoginLink(
            token_sha256=security.sha256(token),
            user_id=user.id,
            firm_id=firm_id,
            purpose=purpose,
            expires_at=utcnow() + timedelta(hours=hours),
        )
    )
    return token


def link_mail(
    session: Session,
    user: User,
    kind: Literal["login", "invite", "confirm"],
    *,
    firm: Firm | None = None,
    by: User | None = None,
    next_path: str | None = None,
) -> Mail | None:
    """A fresh link and the email that carries it, or None when rate limited. Commits the link."""
    settings = get_settings()
    if kind == "login" and user.email_confirmed_at is None:
        kind = "confirm"  # never opened a link: this one confirms the address as well
    purpose = LinkPurpose(kind)
    hours = {"login": settings.link_minutes / 60, "confirm": CONFIRM_HOURS, "invite": INVITE_HOURS}[kind]
    token = new_link(session, user, purpose, firm.id if firm else None, hours)
    session.commit()
    if token is None:
        return None
    url = link_url(token, next_path)
    partner_note = ""
    if needs_password_role(session, user):
        partner_note = "\n\nAs a partner you'll also be asked for your password" + (
            ", which you choose the first time." if user.password_hash is None else "."
        )
    if kind == "invite":
        inviter = f"{by.name} ({by.email})" if by else "A partner"
        firm_name = firm.name if firm else "their firm"
        return Mail(
            to=user.email,
            subject=f"You're invited to {firm_name} on Kebera",
            text=f"{inviter} added you to {firm_name} on Kebera.{partner_note}\n\n"
            f"The link works once, for {INVITE_HOURS} hours. After that, sign in with your email address.",
            button="Open Kebera",
            url=url,
        )
    if kind == "confirm":
        return Mail(
            to=user.email,
            subject="Confirm your email for Kebera",
            text=f"Press the button to confirm your email address and sign in to Kebera.{partner_note}\n\n"
            f"The link works once, for {CONFIRM_HOURS} hours. If you didn't ask for this, ignore this email.",
            button="Confirm and sign in",
            url=url,
        )
    return Mail(
        to=user.email,
        subject="Sign in to Kebera",
        text=f"Press the button to sign in to Kebera.{partner_note}\n\n"
        f"The link works once, for {settings.link_minutes} minutes. If you didn't ask for this, ignore this "
        "email: nobody can sign in without the link.",
        button="Sign in",
        url=url,
    )


# ---------- sessions ----------


def start_session(
    session: Session, user: User, firm_id: uuid.UUID | None, *, password_pending: bool
) -> tuple[str, AuthSession]:
    token = security.new_token()
    hours = PASSWORD_STEP_MINUTES / 60 if password_pending else get_settings().session_hours
    a = AuthSession(
        token_sha256=security.sha256(token),
        user_id=user.id,
        firm_id=firm_id,
        password_pending=password_pending,
        expires_at=utcnow() + timedelta(hours=hours),
    )
    session.add(a)
    session.flush()
    return token, a


def choose_firm(session: Session, user: User, preferred: uuid.UUID | None) -> uuid.UUID | None:
    """The firm to work in: `preferred` if they are an active member, else their first firm."""
    memberships = active_memberships(session, user)
    for m, _ in memberships:
        if m.firm_id == preferred:
            return m.firm_id
    return memberships[0][0].firm_id if memberships else None


def use_link(session: Session, token: str) -> tuple[str, AuthSession, User]:
    """Opens an emailed link: confirms the address and starts a session (a partner's waits for their
    password). Returns the session token, the session and the user."""
    bad = AuthError("this link has expired or was already used; ask for a new one")
    now = utcnow()
    link = session.scalar(select(LoginLink).where(LoginLink.token_sha256 == security.sha256(token or "")))
    if link is None or link.used_at is not None or link.expires_at <= now:
        raise bad
    user = session.get(User, link.user_id)
    if user is None or not user.is_active:
        raise bad
    # One link signs in once; the person's other unused links stop working too.
    session.execute(
        update(LoginLink).where(LoginLink.user_id == user.id, LoginLink.used_at.is_(None)).values(used_at=now)
    )
    if user.email_confirmed_at is None:
        user.email_confirmed_at = now
    firm_id = choose_firm(session, user, link.firm_id)
    pending = needs_password_role(session, user)
    session_token, a = start_session(session, user, firm_id, password_pending=pending)
    if not pending:
        user.last_login_at = now
        audit(session, firm_id=firm_id, actor=user, action="auth.login")
    session.commit()
    return session_token, a, user


def enter_password(session: Session, a: AuthSession, user: User, password: str) -> None:
    """A partner's second step. Sets the password the first time; checks it after that."""
    now = utcnow()
    if user.password_hash is None:
        try:
            user.password_hash = security.hash_password(password)
        except security.WeakPassword as e:
            raise AuthError(str(e)) from e
        audit(session, firm_id=a.firm_id, actor=user, action="auth.password_set")
    else:
        locked = user.locked_until is not None and user.locked_until > now
        ok = security.verify_password(
            user.password_hash, password
        )  # always do the work, so a lock looks the same
        if locked or not ok:
            if not locked:
                user.failed_logins += 1
                if user.failed_logins >= MAX_FAILED_LOGINS:
                    user.locked_until, user.failed_logins = now + timedelta(minutes=LOCK_MINUTES), 0
                    a.revoked_at = now  # start again from a new link after the lock
                    audit(session, firm_id=a.firm_id, actor=user, action="auth.locked")
                session.commit()
            raise AuthError("wrong password")
        if security.needs_rehash(user.password_hash):
            user.password_hash = security.hash_password(password)
    a.password_pending = False
    a.expires_at = now + timedelta(hours=get_settings().session_hours)
    user.failed_logins, user.locked_until, user.last_login_at = 0, None, now
    audit(session, firm_id=a.firm_id, actor=user, action="auth.login")
    session.commit()


def session_for(session: Session, token: str) -> AuthSession | None:
    if not token:
        return None
    a = session.scalar(select(AuthSession).where(AuthSession.token_sha256 == security.sha256(token)))
    if a is None or a.revoked_at is not None or a.expires_at <= utcnow():
        return None
    return a


def revoke_sessions(
    session: Session, user_id: uuid.UUID, *, firm_id: uuid.UUID | None = None, keep: AuthSession | None = None
) -> None:
    """Signs a person out everywhere (or only from `firm_id`), except the session `keep`."""
    q = update(AuthSession).where(AuthSession.user_id == user_id, AuthSession.revoked_at.is_(None))
    if firm_id is not None:
        q = q.where(AuthSession.firm_id == firm_id)
    if keep is not None:
        q = q.where(AuthSession.id != keep.id)
    session.execute(q.values(revoked_at=utcnow()))


# ---------- the request's context ----------


@dataclass
class Context:
    """Who is calling and in which firm; built for each request from the session token."""

    user: User
    auth_session: AuthSession
    firm: Firm | None = None
    membership: Membership | None = None
    firms: list[tuple[Membership, Firm]] = field(default_factory=list)
    password_step: Literal["set", "enter"] | None = None

    @property
    def permissions(self) -> frozenset[str]:
        if self.password_step or self.membership is None:
            return frozenset()
        return ROLE_PERMISSIONS[self.membership.role]

    @property
    def firm_id(self) -> uuid.UUID:
        """The firm every query is scoped to. Only call it once a permission has been checked."""
        if self.firm is None:
            raise RuntimeError("no firm in this context")
        return self.firm.id


def load_context(session: Session, token: str) -> Context | None:
    a = session_for(session, token)
    if a is None:
        return None
    user = session.get(User, a.user_id)
    if user is None or not user.is_active:
        return None
    firms = active_memberships(session, user)
    pairs = {m.firm_id: (m, f) for m, f in firms}
    if a.firm_id not in pairs and (firms or a.firm_id is not None):
        # Removed from that firm since signing in: move to another of theirs, if any.
        a.firm_id = firms[0][0].firm_id if firms else None
        session.commit()
    membership, firm = pairs.get(a.firm_id, (None, None)) if a.firm_id else (None, None)
    step: Literal["set", "enter"] | None = None
    needs_pw = any(m.role in PASSWORD_ROLES for m, _ in firms)
    if needs_pw and (a.password_pending or user.password_hash is None):
        step = "set" if user.password_hash is None else "enter"
    return Context(
        user=user, auth_session=a, firm=firm, membership=membership, firms=firms, password_step=step
    )
