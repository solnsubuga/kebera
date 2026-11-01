# Architecture

```
browser ──> web (nginx: the built React app) ──/api/──> api (FastAPI) ──> db (Postgres)
                                                                       ^
                                                 worker (APScheduler) ─┘
```

## Processes

- **web**: nginx serves the built app and passes `/api/` to the API. The browser sees one origin, so there is
  no CORS in production and no API URL baked into the build. In development the Vite server does the same
  proxying.
- **api**: FastAPI, stateless; scale it as needed. It never runs scheduled work.
- **worker**: exactly one. It owns the schedules (`app/worker/tasks.py`), stored in Postgres so they survive
  restarts, and runs them only when `KEBERA_SCHEDULES_ENABLED=1`. It writes a heartbeat every minute, which
  `/api/health` reports, so a dead worker shows up in the app's sidebar.
- **migrate**: a one-shot `alembic upgrade head` that runs before the API and the worker start.

The API, worker and migrations share one image (`backend/Dockerfile`) with different commands.

## Adding a feature

Backend, for a new thing `X`:

1. `app/models/x.py`, then import it in `app/models/__init__.py`.
2. `make migration m="add x"` and read the generated file.
3. `app/schemas/x.py` for what goes in and out, `app/services/x.py` for the rules,
   `app/api/routes/x.py` for the HTTP layer; include the router in `app/api/router.py`.
4. Tests in `tests/test_x.py` through the HTTP client.

Frontend: a folder `src/features/x/` with `types.ts` (mirroring the schemas), `api.ts` (query keys,
`queryOptions`, hooks and mutations that invalidate by key), `components/` and `pages/`; add the page to
`src/app/router.tsx` as a lazy route.

A background job: a function in `app/worker/tasks.py` that opens its own session and is safe to run twice,
plus a trigger in `SCHEDULES`. Run it by hand with `python -m app.worker run-once <name>`.

## Sign-in and firms

A **firm** is the tenant. Every engagement has a `firm_id`, and every session works in one firm at a time.
Routes take the caller through `require("<permission>")` (`app/api/deps.py`), which answers 401 without a
session and 403 without the permission, and hands back a context whose `firm_id` every service query filters
on. Another firm's engagement answers 404, exactly like one that does not exist. A new feature that stores
client data must take the firm the same way, with tests in the style of `tests/test_firms.py`.

People sign in with a one-use link emailed to them (no passwords), except **partners**, who also enter a
password (Argon2; five wrong ones lock the account for 15 minutes). Roles and what they may do:

| Role | Permissions |
| --- | --- |
| staff | `engagements.read` |
| manager | staff's, plus `engagements.write` |
| partner | manager's, plus `engagements.sign`, `members.manage`, `audit.read` |

A person can be in several firms and switch between them. Sessions are an HttpOnly, SameSite=Lax cookie for
the web app or `Authorization: Bearer <token>` for scripts; only token hashes are stored. Sign-ins and changes
to people, roles and engagements go to `audit_events` (`GET /api/audit`, partners). Partners add people with `POST /api/members`; their screens come with the Trust and settings work.

Anyone can open a new firm from the sign-in page (turn that off with `KEBERA_SIGNUP_OPEN=0`). From the
server's shell, `python -m app.cli` creates firms, adds members, prints a sign-in link (for when email is not
set up) and clears a locked-out partner's password. Emails go to the API log until
`KEBERA_EMAIL_BACKEND=resend` and `KEBERA_RESEND_API_KEY` are set.

## Conventions

- Settings come only from `KEBERA_*` environment variables (`app/core/config.py`); `.env.example` lists them.
- Postgres is the only database, in tests too, so what passes in CI behaves the same in production.
- Invariants live in the schema where they can (check constraints, enums, foreign keys), not only in Python.
- Logs are JSON lines with a request id; the same id is returned in the `x-request-id` header.
- Business rules go in services, not routes, so the worker and tests can call them directly.

## What came from laba

Kept: one image for API and worker; exactly one worker owning the schedules, stored in the database and off
unless enabled; nginx serving the app and proxying `/api/` on the same origin; long caching for hashed assets
and none for `index.html`; tests that build the database with the real migrations; Compose with a dev override
for hot reload and a prod override with Caddy for https; accepting plain `postgres://` URLs from hosts.

Also from laba: passwordless sign-in with emailed one-use links, a password step for the most powerful
role, token hashes instead of tokens, sign-up and sign-in answers that never say who has an account, the
audit trail, and the shell commands for the first account. Kebera adds firms (laba serves one country per
deployment, so it has no tenants).

Left out for now: SQLite support, the country packs, the benchmark pipeline, S3 storage.
