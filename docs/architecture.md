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

Left out for now: SQLite support, the country packs, the benchmark pipeline, S3 storage, sign-in and roles.
Sign-in and per-firm data separation are the next pieces to add before any real client data goes in.
