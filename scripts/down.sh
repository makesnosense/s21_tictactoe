#!/bin/bash

set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$SCRIPT_DIR/.."

cd "$PROJECT_ROOT"

echo "⏏ Shutting down containers"
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
