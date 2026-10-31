"""Sign-in. There are no passwords except for partners; every sign-in emails a one-use link.

signup and link answer 202 whether or not the address has an account, and send the email after the
response, so neither says who has one.
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, Response, status
from sqlalchemy import select

from app.api.deps import COOKIE, DB, SignedIn, Token
from app.core import security
from app.core.config import get_settings
from app.models import User
from app.schemas.auth import (
    EmailIn,
    FirmOut,
    Me,
    Options,
    PasswordChangeIn,
    PasswordStepIn,
    Sent,
    SignupIn,
    SwitchFirmIn,
    UserOut,
    Verified,
    VerifyIn,
)
from app.services import auth, mailer
from app.services.auth import AuthError, Context

router = APIRouter(prefix="/auth", tags=["sign-in"])


def me_out(ctx: Context) -> Me:
    return Me(
        user=UserOut.model_validate(ctx.user),
        firm=FirmOut(id=ctx.firm.id, name=ctx.firm.name, role=ctx.membership.role)
        if ctx.firm and ctx.membership
        else None,
        firms=[FirmOut(id=f.id, name=f.name, role=m.role) for m, f in ctx.firms],
        permissions=sorted(ctx.permissions),
        password_step=ctx.password_step,
    )


def _set_cookie(request: Request, response: Response, token: str, max_age: int) -> None:
    secure = get_settings().cookie_secure
    response.set_cookie(
        COOKIE,
        token,
        max_age=max_age,
        httponly=True,
        samesite="lax",
        secure=request.url.scheme == "https" if secure is None else secure,
        path="/",
    )


def _queue(tasks: BackgroundTasks, mail: mailer.Mail | None) -> None:
    if mail is not None:
        tasks.add_task(mailer.send, mail)


def _email(value: str) -> str:
    try:
        return auth.norm_email(value)
    except AuthError as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(e)) from e


@router.get("/options", response_model=Options)
def options() -> Options:
    s = get_settings()
    return Options(signup=s.signup_open, link_minutes=s.link_minutes)


@router.post("/signup", response_model=Sent, status_code=status.HTTP_202_ACCEPTED)
def signup(body: SignupIn, tasks: BackgroundTasks, session: DB) -> Sent:
    """Opens a new firm with the caller as its partner. An address that already has an account gets a
    sign-in link instead, so the answer never says whether it does."""
    email = _email(body.email)
    user = session.scalar(select(User).where(User.email == email))
    if user is None:
        if not get_settings().signup_open:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "sign-up is closed; ask a partner to add you")
        user = auth.get_or_create_user(session, email, body.name)
        firm = auth.create_firm(session, body.firm_name, user)
        auth.audit(session, firm_id=firm.id, actor=user, action="firm.created", target=firm.name)
        session.commit()
        _queue(tasks, auth.link_mail(session, user, "confirm", firm=firm, next_path=body.next))
    elif user.is_active:
        _queue(tasks, auth.link_mail(session, user, "login", next_path=body.next))
    return Sent()


@router.post("/link", response_model=Sent, status_code=status.HTTP_202_ACCEPTED)
def request_link(body: EmailIn, tasks: BackgroundTasks, session: DB) -> Sent:
    user = auth.find_user(session, _email(body.email))
    if user is not None and user.is_active:
        _queue(tasks, auth.link_mail(session, user, "login", next_path=body.next))
    return Sent()


@router.post("/verify", response_model=Verified)
def verify(body: VerifyIn, request: Request, response: Response, session: DB) -> Verified:
    try:
        token, a, _ = auth.use_link(session, body.token)
    except AuthError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(e)) from e
    _set_cookie(request, response, token, int((a.expires_at - auth.utcnow()).total_seconds()))
    ctx = auth.load_context(session, token)
    assert ctx is not None
    return Verified(token=token, me=me_out(ctx))


@router.post("/password", response_model=Me)
def password_step(
    body: PasswordStepIn, request: Request, response: Response, ctx: SignedIn, session: DB, token: Token
) -> Me:
    """A partner's second step after the link (they choose the password the first time)."""
    if ctx.password_step is None:
        raise HTTPException(status.HTTP_409_CONFLICT, "no password is needed now")
    first = ctx.password_step == "set"
    try:
        auth.enter_password(session, ctx.auth_session, ctx.user, body.password)
    except AuthError as e:
        code = status.HTTP_422_UNPROCESSABLE_CONTENT if first else status.HTTP_401_UNAUTHORIZED
        raise HTTPException(code, str(e)) from e
    if request.cookies.get(COOKIE) == token:  # the browser: the cookie now lasts as long as the session
        _set_cookie(request, response, token, get_settings().session_hours * 3600)
    new_ctx = auth.load_context(session, token)
    assert new_ctx is not None
    return me_out(new_ctx)


@router.post("/password/change", status_code=status.HTTP_204_NO_CONTENT)
def change_password(body: PasswordChangeIn, ctx: SignedIn, session: DB) -> Response:
    """A partner changes their password; every other session of theirs is signed out."""
    user = ctx.user
    if ctx.password_step or user.password_hash is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "enter your password first")
    if not security.verify_password(user.password_hash, body.current_password):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "current password is wrong")
    if body.new_password == body.current_password:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "choose a new password")
    try:
        user.password_hash = security.hash_password(body.new_password)
    except security.WeakPassword as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(e)) from e
    auth.revoke_sessions(session, user.id, keep=ctx.auth_session)
    auth.audit(session, firm_id=ctx.auth_session.firm_id, actor=user, action="auth.password_changed")
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/firm", response_model=Me)
def switch_firm(body: SwitchFirmIn, ctx: SignedIn, session: DB, token: Token) -> Me:
    """Work in another of your firms. Everything you see from then on is that firm's."""
    if body.firm_id not in {m.firm_id for m, _ in ctx.firms}:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "you are not a member of that firm")
    ctx.auth_session.firm_id = body.firm_id
    session.commit()
    new_ctx = auth.load_context(session, token)
    assert new_ctx is not None
    return me_out(new_ctx)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(session: DB, token: Token, response: Response) -> Response:
    a = auth.session_for(session, token)
    if a is not None:
        a.revoked_at = auth.utcnow()
        session.commit()
    response.status_code = status.HTTP_204_NO_CONTENT
    response.delete_cookie(COOKIE, path="/")
    return response


@router.get("/me", response_model=Me)
def me(ctx: SignedIn) -> Me:
    return me_out(ctx)
