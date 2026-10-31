# One image for the API, the worker and migrations (same code, different command).
#   docker build -t kebera-api backend
#   docker run kebera-api                            # API on :8000
#   docker run kebera-api python -m app.worker       # the worker
#   docker run kebera-api alembic upgrade head       # migrations
FROM python:3.12-slim AS build
RUN pip install --no-cache-dir "uv>=0.11,<0.14"
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never
WORKDIR /srv
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev --no-install-project

FROM python:3.12-slim
RUN useradd --system --uid 10001 --home /srv kebera
WORKDIR /srv
COPY --from=build /srv/.venv /srv/.venv
COPY --chown=kebera alembic.ini ./
COPY --chown=kebera alembic ./alembic
COPY --chown=kebera app ./app
ENV PATH=/srv/.venv/bin:$PATH PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
USER kebera
EXPOSE 8000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health/live')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=*", "--no-access-log"]
