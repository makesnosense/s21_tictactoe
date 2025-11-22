#!/bin/bash

set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$SCRIPT_DIR/.."

./down.sh

cd "$PROJECT_ROOT"

echo "🛠️ Rebuilding containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --no-cache

echo "✅ Deployment complete. Checking logs..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=50
