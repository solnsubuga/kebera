# kebera

The audit assistant for company financial statement audits: plan, test and close an engagement, with every
check traceable to its source. It grows out of [laba](https://github.com/solnsubuga/laba), which does the same
for Ugandan public audit reports.

This repository is the starting scaffold: one working feature (engagements) end to end, so every new feature
has a pattern to copy. See [docs/architecture.md](docs/architecture.md).

| Part | Stack |
| --- | --- |
| API | FastAPI, SQLAlchemy 2, Alembic, Pydantic settings, structlog |
| Worker | APScheduler 3 (schedules stored in Postgres) |
| Database | Postgres 17 |
| Web | React 19, Vite, TypeScript, TanStack Query, React Router, Tailwind CSS 4, shadcn/ui |
| Delivery | Docker Compose (nginx in front, Caddy for https), GitHub Actions |

## Run it

```sh
cp .env.example .env
docker compose up --build -d --wait   # http://localhost:8080 (API docs: http://localhost:8000/api/docs)
make dev                              # the same with hot reload: web on :5173, API on :8000
```

Without Docker you need [uv](https://docs.astral.sh/uv/), Node 22 and a Postgres:

```sh
make install
make api      # terminal 1 (applies migrations first)
make worker   # terminal 2
make web      # terminal 3: http://localhost:5173
```

`make help` lists every task.

## Checks

```sh
make check    # lint, format, types and tests for both apps: the same as CI
```

Backend tests run against a real Postgres (`TEST_DB`, default `kebera_test` on localhost; it is wiped on each run)
and build it with the Alembic migrations, so they also fail when a model changes without a migration.

CI (`.github/workflows/ci.yml`) runs on every pull request: backend and frontend checks (only for the side that
changed), then builds both images, starts the whole stack with Compose and calls it through nginx.

## Layout

```
backend/
  app/
    main.py            the FastAPI app: middleware, routers
    core/              settings (KEBERA_* env vars), database, logging
    models/            SQLAlchemy tables (import them in models/__init__.py)
    schemas/           Pydantic request and response shapes
    services/          the rules: queries and changes, no HTTP
    api/routes/        thin HTTP handlers: parse, call a service, shape the answer
    worker/            the scheduler process and its tasks
  alembic/versions/    migrations
  tests/
frontend/
  src/
    app/               providers, query client, routes
    components/ui/     shadcn/ui components (generated; edit freely)
    components/layout/ the shell around every page
    features/<name>/   one folder per feature: api.ts (queries), types.ts, components/, pages/
    lib/               the API client and small helpers
  docker/              nginx config for the production image
docker-compose.yml     the stack; .dev.yml adds hot reload, .prod.yml adds https
```
