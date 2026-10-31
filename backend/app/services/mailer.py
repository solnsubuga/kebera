"""Sending email: sign-in links, sign-up confirmations and invitations.

KEBERA_EMAIL_BACKEND picks how they go out:

    console  writes each email, link included, to the log; for development and tests (the default).
             The latest ones are also kept in OUTBOX, so tests can open the links.
    resend   through Resend's API (https://resend.com); needs KEBERA_RESEND_API_KEY, and
             KEBERA_EMAIL_FROM on a domain verified there.

Emails are sent after the response (FastAPI background tasks), so how long a request takes says nothing about
whether an account exists. A failure is logged, never shown to the person asking.
"""

import html
import json
import urllib.request
from dataclasses import dataclass

import structlog

from app.core.config import get_settings

log = structlog.get_logger("kebera.mail")
RESEND_URL = "https://api.resend.com/emails"


@dataclass(frozen=True)
class Mail:
    to: str
    subject: str
    text: str
    button: str  # the call to action
    url: str  # where the button goes

    @property
    def html(self) -> str:
        paragraphs = "".join(
            f"<p>{html.escape(p).replace(chr(10), '<br>')}</p>" for p in self.text.split("\n\n") if p.strip()
        )
        return (
            '<div style="font-family:system-ui,sans-serif;max-width:480px;line-height:1.5">'
            f"{paragraphs}"
            f'<p><a href="{html.escape(self.url)}" style="display:inline-block;padding:10px 16px;'
            f'background:#111;color:#fff;border-radius:6px;text-decoration:none">{html.escape(self.button)}</a></p>'
            '<p style="color:#666;font-size:13px">Or paste this into your browser: '
            f"{html.escape(self.url)}</p>"
            "</div>"
        )

    @property
    def plain(self) -> str:
        return f"{self.text}\n\n{self.button}: {self.url}\n"


OUTBOX: list[Mail] = []


def _resend(m: Mail) -> None:
    settings = get_settings()
    if not settings.resend_api_key:
        raise RuntimeError("KEBERA_EMAIL_BACKEND=resend needs KEBERA_RESEND_API_KEY")
    body = {"from": settings.email_from, "to": [m.to], "subject": m.subject, "html": m.html, "text": m.plain}
    req = urllib.request.Request(
        RESEND_URL,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {settings.resend_api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as r:  # raises on 4xx and 5xx
        r.read()


def send(m: Mail) -> None:
    try:
        if get_settings().email_backend == "resend":
            _resend(m)
        else:
            OUTBOX.append(m)
            del OUTBOX[:-50]
            log.warning("email (console backend)", to=m.to, subject=m.subject, body=m.plain)
        log.info("email sent", to=m.to, subject=m.subject)
    except Exception:
        log.exception("email failed", to=m.to, subject=m.subject)
