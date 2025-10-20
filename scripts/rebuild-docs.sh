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

# Completely restart the docs container to pick up content changes
echo "🔄 Completely restarting docs container to pick up content changes..."
docker stop $DOCS_CONTAINER
docker rm $DOCS_CONTAINER
# Recreate docs container with same configuration
docker run -d --name docs --network coin_default -p 5175:3000 -v /app/docs/content:/app/content -e NODE_ENV=production -e VITE_BACKEND_URL=${VITE_BACKEND_URL} -e PORT=3000 coin-docs

# Wait a moment for the container to fully start
sleep 5

# Check if the container is running
if ! docker ps | grep -q "docs"; then
    echo "❌ Docs container failed to restart"
    exit 1
fi

echo "✅ Docs container restarted successfully"

echo "✅ Documentation rebuild completed successfully!"

# Optional: Notify backend that rebuild is complete
echo "📡 Notifying backend of successful rebuild..."
curl -X POST http://localhost:3000/api/docs/rebuild-complete || echo "⚠️ Could not notify backend"

echo "🎉 Documentation rebuild process finished!"
