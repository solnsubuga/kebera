from collections.abc import Callable
from typing import Annotated

from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_session
from app.services.auth import Context, load_context

DB = Annotated[Session, Depends(get_session)]

COOKIE = "kebera_session"


def bearer(authorization: str | None) -> str:
    return (authorization or "").removeprefix("Bearer ").strip()


def session_token(
    authorization: Annotated[str | None, Header()] = None,
    kebera_session: Annotated[str | None, Cookie()] = None,
) -> str:
    """The caller's session token: a Bearer header (scripts) or the cookie (the web app)."""
    return bearer(authorization) or (kebera_session or "")


Token = Annotated[str, Depends(session_token)]


def signed_in(session: DB, token: Token) -> Context:
    ctx = load_context(session, token)
    if ctx is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "sign in required")
    return ctx


SignedIn = Annotated[Context, Depends(signed_in)]


def require(permission: str) -> Callable[[Context], Context]:
    """A dependency that answers 403 unless the caller holds `permission` in their current firm.
    The context it returns always has a firm, so `ctx.firm_id` is safe to use for scoping."""

    def dep(ctx: SignedIn) -> Context:
        if ctx.password_step:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "enter your password first")
        if ctx.membership is None:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "you are not a member of any firm")
        if permission not in ctx.permissions:
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"your role cannot do this ({permission})")
        return ctx

    return dep
