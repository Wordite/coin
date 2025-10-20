#!/bin/bash
# Rebuild docs: rebuild image -> restart container from new image
# Intended to run inside a controller container (you already check /.dockerenv in original script)
set -euo pipefail

DOCS_DIR=${DOCS_DIR:-/home/coin/docs}
IMAGE_NAME=${IMAGE_NAME:-coin-docs}
CONTAINER_NAME=${CONTAINER_NAME:-docs}
NETWORK_NAME=${NETWORK_NAME:-coin_default}
HOST_CONTENT_DIR=${HOST_CONTENT_DIR:-${DOCS_DIR}/content}
HOST_BUILD_DIR=${HOST_BUILD_DIR:-${DOCS_DIR}/build}
PORT_MAPPING=${PORT_MAPPING:-5175:3000}

echo "🔄 Starting documentation rebuild (image build + container restart)..."

# basic checks
if [ "${NODE_ENV:-}" != "production" ]; then
  echo "❌ NODE_ENV != production. This script should run only in production."
  exit 1
fi

if [ ! -f /.dockerenv ]; then
  echo "❌ Not running inside Docker container. This script is intended to run inside Docker."
  exit 1
fi

if ! command -v docker &>/dev/null; then
  echo "❌ docker CLI not found inside this container."
  exit 1
fi

# Build image
echo "📦 Building docker image '${IMAGE_NAME}' from '${DOCS_DIR}'..."
docker build --pull \
  --build-arg VITE_BACKEND_URL="${VITE_BACKEND_URL:-}" \
  --build-arg NODE_ENV=production \
  -t "${IMAGE_NAME}" "${DOCS_DIR}"

# Stop + remove old container if exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "🛑 Stopping and removing existing container '${CONTAINER_NAME}'..."
  docker rm -f "${CONTAINER_NAME}" || true
fi

# Start new container from rebuilt image
echo "🚀 Starting new container '${CONTAINER_NAME}'..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --network "${NETWORK_NAME}" \
  -p ${PORT_MAPPING} \
  -v "${HOST_CONTENT_DIR}":/app/content:ro \
  -e NODE_ENV=production \
  -e VITE_BACKEND_URL="${VITE_BACKEND_URL:-}" \
  "${IMAGE_NAME}"

# Wait a little for the service to come up
sleep 4

# Basic verification
echo "🔎 Verify container is running:"
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "✅ Container '${CONTAINER_NAME}' is running."
else
  echo "❌ Container '${CONTAINER_NAME}' is not running. Showing last 200 logs for debugging:"
  docker logs "${CONTAINER_NAME}" --tail 200 || true
  exit 1
fi

echo "📁 Inspecting mounts:"
docker inspect "${CONTAINER_NAME}" --format '{{json .Mounts}}' | jq .

echo "📄 Checking /app/build content inside the container (should exist if build succeeded):"
docker exec "${CONTAINER_NAME}" sh -c "if [ -d /app/build ]; then ls -la /app/build | head -n 50; else echo '/app/build not found'; fi" || true

echo "🧾 Last 200 container logs:"
docker logs "${CONTAINER_NAME}" --tail 200 || true

echo "✅ Documentation rebuild finished successfully."
