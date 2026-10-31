"""The people in the caller's firm, and the firm's audit trail. Partners only.

A firm always keeps at least one active partner, and nobody changes their own role or switches themselves
off. Everything here is scoped to the caller's firm: a membership of another firm answers 404.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import DB, require
from app.models import AuditEvent, MemberRole, Membership, User
from app.schemas.auth import AuditEventOut, MemberIn, MemberOut, MemberPatch
from app.services import auth, mailer
from app.services.auth import AuthError, Context

router = APIRouter(tags=["members"])
Partner = Annotated[Context, Depends(require("members.manage"))]
AuditReader = Annotated[Context, Depends(require("audit.read"))]


def member_out(m: Membership, u: User, link_sent: bool = False) -> MemberOut:
    return MemberOut(
        id=m.id,
        user_id=u.id,
        email=u.email,
        name=u.name,
        role=m.role,
        is_active=m.is_active and u.is_active,
        confirmed=u.email_confirmed_at is not None,
        has_password=u.password_hash is not None,
        locked=u.locked_until is not None and u.locked_until > auth.utcnow(),
        created_at=m.created_at,
        last_login_at=u.last_login_at,
        link_sent=link_sent,
    )


def _member(session: Session, ctx: Context, membership_id: uuid.UUID) -> tuple[Membership, User]:
    row = session.execute(
        select(Membership, User)
        .join(User, User.id == Membership.user_id)
        .where(Membership.id == membership_id, Membership.firm_id == ctx.firm_id)
    ).first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "member not found")
    return row[0], row[1]


@router.get("/members", response_model=list[MemberOut])
def list_members(ctx: Partner, session: DB) -> list[MemberOut]:
    rows = session.execute(
        select(Membership, User)
        .join(User, User.id == Membership.user_id)
        .where(Membership.firm_id == ctx.firm_id)
        .order_by(User.email)
    ).all()
    return [member_out(m, u) for m, u in rows]


@router.post("/members", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def add_member(body: MemberIn, tasks: BackgroundTasks, ctx: Partner, session: DB) -> MemberOut:
    """Adds someone to the firm and emails them an invitation. They may already use Kebera elsewhere."""
    try:
        user = auth.get_or_create_user(session, body.email, body.name)
    except AuthError as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(e)) from e
    existing = session.scalar(
        select(Membership).where(Membership.firm_id == ctx.firm_id, Membership.user_id == user.id)
    )
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, f"{user.email} is already a member; change their role")
    had_password_role = auth.needs_password_role(session, user)
    m = Membership(firm_id=ctx.firm_id, user_id=user.id, role=body.role)
    session.add(m)
    if body.role in auth.PASSWORD_ROLES and not had_password_role:
        auth.revoke_sessions(session, user.id)  # they sign in again, with a password this time
    auth.audit(
        session, firm_id=ctx.firm_id, actor=ctx.user, action="member.added", target=user.email, role=body.role
    )
    session.commit()
    mail = auth.link_mail(session, user, "invite", firm=ctx.firm, by=ctx.user)
    if mail:
        tasks.add_task(mailer.send, mail)
    return member_out(m, user, link_sent=mail is not None)


@router.patch("/members/{membership_id}", response_model=MemberOut)
def update_member(
    membership_id: uuid.UUID, body: MemberPatch, tasks: BackgroundTasks, ctx: Partner, session: DB
) -> MemberOut:
    m, target = _member(session, ctx, membership_id)
    if target.id == ctx.user.id and (
        (body.role is not None and body.role != m.role) or body.is_active is False or body.clear_password
    ):
        raise HTTPException(status.HTTP_409_CONFLICT, "ask another partner to change your own role or access")
    losing_partner = (
        m.role == MemberRole.partner
        and m.is_active
        and ((body.role is not None and body.role != MemberRole.partner) or body.is_active is False)
    )
    if losing_partner and auth.active_partners(session, ctx.firm_id) <= 1:
        raise HTTPException(status.HTTP_409_CONFLICT, "a firm needs at least one active partner")

    if body.role is not None and body.role != m.role:
        auth.audit(
            session,
            firm_id=ctx.firm_id,
            actor=ctx.user,
            action="member.role_set",
            target=target.email,
            role=body.role,
            previous=m.role,
        )
        had_password_role = auth.needs_password_role(session, target)
        m.role = body.role
        if body.role in auth.PASSWORD_ROLES and not had_password_role:
            auth.revoke_sessions(session, target.id)  # they sign in again, with a password this time
    if body.is_active is not None and body.is_active != m.is_active:
        m.is_active = body.is_active
        if not body.is_active:
            auth.revoke_sessions(session, target.id, firm_id=ctx.firm_id)
        action = "member.activated" if body.is_active else "member.deactivated"
        auth.audit(session, firm_id=ctx.firm_id, actor=ctx.user, action=action, target=target.email)
    if body.clear_password:
        if target.password_hash is None and target.locked_until is None:
            raise HTTPException(status.HTTP_409_CONFLICT, f"{target.email} has no password to clear")
        target.password_hash, target.failed_logins, target.locked_until = None, 0, None
        auth.revoke_sessions(session, target.id)
        auth.audit(
            session,
            firm_id=ctx.firm_id,
            actor=ctx.user,
            action="member.password_cleared",
            target=target.email,
        )
    session.commit()

    link_sent = False
    if body.send_link:
        if not (m.is_active and target.is_active):
            raise HTTPException(status.HTTP_409_CONFLICT, f"{target.email} is switched off")
        mail = auth.link_mail(
            session,
            target,
            "login" if target.email_confirmed_at else "invite",
            firm=ctx.firm,
            by=ctx.user,
        )
        if mail:
            tasks.add_task(mailer.send, mail)
            link_sent = True
        auth.audit(
            session, firm_id=ctx.firm_id, actor=ctx.user, action="member.link_sent", target=target.email
        )
        session.commit()
    return member_out(m, target, link_sent=link_sent)


@router.get("/audit", response_model=list[AuditEventOut])
def list_audit(
    ctx: AuditReader,
    session: DB,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
    before: Annotated[int | None, Query(ge=1)] = None,
) -> list[AuditEvent]:
    """The firm's audit trail, newest first. Page back with `before` (the last id you got)."""
    q = select(AuditEvent).where(AuditEvent.firm_id == ctx.firm_id)
    if before is not None:
        q = q.where(AuditEvent.id < before)
    return list(session.scalars(q.order_by(AuditEvent.id.desc()).limit(limit)))
