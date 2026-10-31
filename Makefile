# Common tasks. `make help` lists them.
.DEFAULT_GOAL := help
COMPOSE_DEV := docker compose -f docker-compose.yml -f docker-compose.dev.yml
TEST_DB ?= postgresql+psycopg://kebera:kebera@localhost:5432/kebera_test

.PHONY: help
help:  ## List the tasks
	@grep -hE '^[a-z.-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

## --- Docker ---
.PHONY: dev up down logs psql
dev:  ## Run everything with hot reload (web :5173, api :8000)
	$(COMPOSE_DEV) up --build
up:  ## Run the stack as in production (http://localhost:8080)
	docker compose up --build -d --wait
down:  ## Stop the stack (data is kept)
	docker compose down
logs:  ## Follow the API and worker logs
	docker compose logs -f api worker
psql:  ## Open psql on the bundled database
	docker compose exec db psql -U kebera kebera

## --- Local, without Docker (needs uv, Node 22 and a Postgres) ---
.PHONY: install api worker web migrate migration
install:  ## Install backend and frontend dependencies
	cd backend && uv sync
	cd frontend && npm ci
api:  ## Run the API with reload
	cd backend && uv run alembic upgrade head && uv run uvicorn app.main:app --reload
worker:  ## Run the worker
	cd backend && uv run python -m app.worker
web:  ## Run the Vite dev server
	cd frontend && npm run dev
migrate:  ## Apply migrations
	cd backend && uv run alembic upgrade head
migration:  ## New migration from model changes: make migration m="add workpapers"
	@test -n "$(m)" || (echo 'usage: make migration m="what changed"' && exit 1)
	cd backend && uv run alembic revision --autogenerate -m "$(m)"

## --- Checks (the same as CI) ---
.PHONY: check lint fmt test test-api test-web
check: lint test  ## Lint and test everything
lint:  ## Lint, format check and type check
	cd backend && uv run ruff check . && uv run ruff format --check . && uv run mypy
	cd frontend && npm run -s lint && npm run -s format:check && npm run -s typecheck
fmt:  ## Format all code
	cd backend && uv run ruff check --fix . && uv run ruff format .
	cd frontend && npm run -s format
test: test-api test-web  ## Run all tests
test-api:  ## Backend tests (wipes the database in TEST_DB)
	cd backend && KEBERA_TEST_DATABASE_URL=$(TEST_DB) uv run pytest
test-web:  ## Frontend tests
	cd frontend && npm test
