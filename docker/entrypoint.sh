#!/bin/sh
set -e

echo "Injecting Doppler secrets into environment variables..."
DOPPLER_ENV_FILE="$(mktemp)"
trap 'rm -f "$DOPPLER_ENV_FILE"' EXIT INT TERM

doppler secrets download --no-file --format env > "$DOPPLER_ENV_FILE"
set -a
. "$DOPPLER_ENV_FILE"
set +a

echo "Applying Alembic migrations..."
alembic -c /app/alembic.ini upgrade head

echo "Starting Uvicorn..."
exec uvicorn main:app --factory --app-dir /app/src/backend --host 0.0.0.0 --port 8000