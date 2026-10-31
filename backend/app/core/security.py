"""Tokens and passwords. Tokens are random and only their SHA-256 is stored; passwords use Argon2."""

import hashlib
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

MIN_PASSWORD = 12
_ph = PasswordHasher()
# Verified against when a user has no password, so a missing account takes as long as a wrong password.
_DUMMY_HASH = _ph.hash("not a real password, only for timing")


def new_token() -> str:
    return secrets.token_urlsafe(32)


def sha256(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class WeakPassword(ValueError):
    pass


def hash_password(password: str) -> str:
    if len(password) < MIN_PASSWORD:
        raise WeakPassword(f"choose a password of at least {MIN_PASSWORD} characters")
    return _ph.hash(password)


def verify_password(password_hash: str | None, password: str) -> bool:
    try:
        return _ph.verify(password_hash or _DUMMY_HASH, password) and password_hash is not None
    except (VerificationError, InvalidHashError):
        return False


def needs_rehash(password_hash: str) -> bool:
    return _ph.check_needs_rehash(password_hash)
