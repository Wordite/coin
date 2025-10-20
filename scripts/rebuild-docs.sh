#!/bin/bash

# Script to rebuild documentation in production
# This script should be called by backend when documentation files change

set -e

echo "🔄 Starting documentation rebuild..."

# Script permissions should be set by docker-compose

# Check if we're in production
if [ "$NODE_ENV" != "production" ]; then
    echo "❌ This script should only run in production"
    exit 1
fi

# Check if we're running inside Docker
if [ ! -f /.dockerenv ]; then
    echo "❌ This script should only run inside Docker container"
    exit 1
fi

# Check if docs service is running
if ! docker ps | grep -q "docs"; then
    echo "❌ Docs service is not running"
    exit 1
fi

# Get the docs container name
DOCS_CONTAINER=$(docker ps --format "table {{.Names}}" | grep docs | head -1)

if [ -z "$DOCS_CONTAINER" ]; then
    echo "❌ Could not find docs container"
    exit 1
fi

echo "📦 Found docs container: $DOCS_CONTAINER"

# Rebuild the docs container from the host context
echo "🔨 Rebuilding docs container..."
cd /app && VITE_BACKEND_URL=${VITE_BACKEND_URL} docker compose -f docker-compose.yml build docs

# Restart the docs container
echo "🔄 Restarting docs container..."
cd /app && docker compose -f docker-compose.yml restart docs

echo "✅ Documentation rebuild completed successfully!"

# Optional: Notify backend that rebuild is complete
echo "📡 Notifying backend of successful rebuild..."
curl -X POST http://localhost:3000/api/docs/rebuild-complete || echo "⚠️ Could not notify backend"

echo "🎉 Documentation rebuild process finished!"
