FROM python:3.12-alpine AS builder

ENV POETRY_VERSION=2.1.3 \
    POETRY_HOME=/opt/poetry \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

ENV PATH="$POETRY_HOME/bin:$PATH"

WORKDIR /app

RUN apk add --no-cache \
    build-base \
    curl \
    libffi-dev \
    openssl-dev \
    postgresql-dev

RUN curl -sSL https://install.python-poetry.org | python3 -

COPY pyproject.toml poetry.lock ./
RUN poetry install --only main --no-ansi

FROM python:3.12-alpine AS runtime

RUN apk add --no-cache ca-certificates curl libstdc++ \
    && curl -Ls -o /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub \
    https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key \
    && echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' >> /etc/apk/repositories \
    && apk add --no-cache doppler

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY alembic.ini /app/alembic.ini
COPY src/backend /app/src/backend
COPY docker/entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]