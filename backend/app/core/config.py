"""Settings, read from the environment (prefix KEBERA_) or a .env file."""

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="KEBERA_", env_file=".env", extra="ignore")

    env: Literal["dev", "test", "prod"] = "dev"
    database_url: str = "postgresql+psycopg://kebera:kebera@localhost:5432/kebera"
    # Origins allowed to call the API from a browser. In Docker the web app reaches the API through
    # nginx on the same origin, so this only matters for the Vite dev server.
    cors_origins: list[str] = ["http://localhost:5173"]
    log_level: str = "INFO"
    log_json: bool = True
    # The worker runs scheduled jobs only when this is on, so a laptop or CI never fires them by surprise.
    schedules_enabled: bool = False
    # How long the worker may be silent before /api/health reports it as down.
    worker_stale_seconds: int = 180

    # --- sign-in (see app/services/auth.py) ---
    # Where the web app is, for the links in emails.
    public_url: str = "http://localhost:5173"
    # Anyone may sign up and open a new firm. Off: firms are made with `python -m app.cli create-firm`.
    signup_open: bool = True
    session_hours: int = 168
    link_minutes: int = 15
    # Secure cookies. Unset: on when the request came in over https. Set it to 1 behind an https proxy.
    cookie_secure: bool | None = None

    # --- email (see app/services/mailer.py) ---
    # console writes each email to the log (and keeps it in memory for tests); resend sends it.
    email_backend: Literal["console", "resend"] = "console"
    email_from: str = "Kebera <no-reply@localhost>"
    resend_api_key: str = ""

    @field_validator("database_url")
    @classmethod
    def _psycopg3(cls, url: str) -> str:
        """Accept the plain postgres:// URLs that hosts hand out and use psycopg 3 for them."""
        for prefix in ("postgres://", "postgresql://"):
            if url.startswith(prefix):
                return "postgresql+psycopg://" + url[len(prefix) :]
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()
