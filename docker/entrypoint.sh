#!/bin/sh
set -e

echo "Applying Alembic migrations..."
alembic -c /app/alembic.ini upgrade head

echo "Starting Uvicorn..."
exec uvicorn main:app --factory --app-dir /app/src/backend --host 0.0.0.0 --port 8000