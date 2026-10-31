"""Firms and people from the server's shell, for the first partner or when email is not set up yet.

    python -m app.cli create-firm "Mukasa & Co" you@example.com --name "Your Name"
    python -m app.cli add-member <firm id> someone@example.com manager
    python -m app.cli link you@example.com          # prints a one-use sign-in link
    python -m app.cli clear-password you@example.com

create-firm makes a firm with you as its partner; sign in from the app with an emailed link (or one printed
by `link`), then choose your password. link prints a link instead of emailing it: anyone who sees it can sign
in once. clear-password removes a partner's password and lifts a lock; after their next link they choose a
new one.
"""

import argparse
import sys
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.models import Firm, LinkPurpose, MemberRole, Membership, User
from app.services import auth
from app.services.auth import AuthError


def _user(s: Session, email: str) -> User:
    u = auth.find_user(s, email)
    if u is None:
        sys.exit(f"no account for {email}")
    return u


def create_firm(s: Session, name: str, email: str, person: str | None) -> None:
    user = auth.get_or_create_user(s, email, person)
    firm = auth.create_firm(s, name, user)
    auth.audit(s, firm_id=firm.id, actor=None, action="firm.created", target=firm.name, via="cli")
    s.commit()
    print(f"firm {firm.id} ({firm.name}) with partner {user.email}")


def add_member(s: Session, firm_id: str, email: str, role: str) -> None:
    firm = s.get(Firm, uuid.UUID(firm_id))
    if firm is None:
        sys.exit(f"no firm {firm_id}")
    user = auth.get_or_create_user(s, email)
    if s.scalar(select(Membership).where(Membership.firm_id == firm.id, Membership.user_id == user.id)):
        sys.exit(f"{user.email} is already in {firm.name}")
    s.add(Membership(firm_id=firm.id, user_id=user.id, role=MemberRole(role)))
    auth.revoke_sessions(s, user.id)
    auth.audit(s, firm_id=firm.id, actor=None, action="member.added", target=user.email, role=role, via="cli")
    s.commit()
    print(f"{user.email} is a {role} in {firm.name}")


def link(s: Session, email: str) -> None:
    user = _user(s, email)
    token = auth.new_link(s, user, LinkPurpose.login, None, hours=1)
    if token is None:
        sys.exit("too many links this hour; try again later")
    s.commit()
    print(auth.link_url(token))


def clear_password(s: Session, email: str) -> None:
    user = _user(s, email)
    user.password_hash, user.failed_logins, user.locked_until = None, 0, None
    auth.revoke_sessions(s, user.id)
    auth.audit(s, firm_id=None, actor=None, action="member.password_cleared", target=user.email, via="cli")
    s.commit()
    print(f"cleared; {user.email} chooses a new password after their next link")


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(prog="python -m app.cli", description=__doc__.split("\n")[0])
    sub = p.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("create-firm", help="a new firm with you as its partner")
    c.add_argument("firm_name")
    c.add_argument("email")
    c.add_argument("--name")
    a = sub.add_parser("add-member", help="add someone to a firm")
    a.add_argument("firm_id")
    a.add_argument("email")
    a.add_argument("role", choices=[r.value for r in MemberRole])
    sub.add_parser("link", help="print a one-use sign-in link").add_argument("email")
    sub.add_parser("clear-password", help="clear a partner's password and lift a lock").add_argument("email")
    args = p.parse_args(argv)
    with SessionLocal() as s:
        try:
            if args.cmd == "create-firm":
                create_firm(s, args.firm_name, args.email, args.name)
            elif args.cmd == "add-member":
                add_member(s, args.firm_id, args.email, args.role)
            elif args.cmd == "link":
                link(s, args.email)
            else:
                clear_password(s, args.email)
        except AuthError as e:
            sys.exit(str(e))


if __name__ == "__main__":
    main()
