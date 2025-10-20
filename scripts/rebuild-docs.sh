#!/bin/bash
# Rebuild docs: rebuild image -> restart container from new image
set -euo pipefail

DOCS_DIR=${DOCS_DIR:-/home/coin/docs}
IMAGE_NAME=${IMAGE_NAME:-coin-docs}
CONTAINER_NAME=${CONTAINER_NAME:-docs}
NETWORK_NAME=${NETWORK_NAME:-coin_default}
HOST_CONTENT_DIR=${HOST_CONTENT_DIR:-${DOCS_DIR}/content}
PORT_MAPPING=${PORT_MAPPING:-5175:3000}
BUILD_LOG=${BUILD_LOG:-/tmp/docs-build.log}

echo "🔄 Starting documentation rebuild (image build + container restart)..."

# env check
if [ "${NODE_ENV:-}" != "production" ]; then
  echo "❌ NODE_ENV != production. This script should run only in production."
  exit 1
fi

# inside docker check okay (we run inside backend)
if [ ! -f /.dockerenv ]; then
  echo "❌ Not running inside Docker container. This script expected to run inside container."
  exit 1
fi

# path existence check (this will verify mount from host)
if [ ! -d "${DOCS_DIR}" ]; then
  echo "❌ Build context not found: ${DOCS_DIR}"
  echo "Make sure you mounted host path ${DOCS_DIR} into the container (see docker-compose)."
  exit 1
fi

# docker CLI check
if ! command -v docker &>/dev/null; then
  echo "❌ docker CLI not found inside this container. Install docker CLI in backend image."
  exit 1
fi

# Build image (log output for debugging)
echo "📦 Building docker image '${IMAGE_NAME}' from '${DOCS_DIR}'..."
# optional: disable BuildKit to avoid buildx warning: DOCKER_BUILDKIT=0
DOCKER_BUILDKIT=${DOCKER_BUILDKIT:-1}
if [ "$DOCKER_BUILDKIT" = "0" ]; then
  echo "⚠️ BuildKit disabled (DOCKER_BUILDKIT=0)."
  DOCKER_BUILDKIT=0 docker build --progress=plain --pull \
    --build-arg VITE_BACKEND_URL="${VITE_BACKEND_URL:-}" \
    --build-arg NODE_ENV=production \
    -t "${IMAGE_NAME}" "${DOCS_DIR}" 2>&1 | tee "${BUILD_LOG}"
else
  # default: allow BuildKit
  docker build --progress=plain --pull \
    --build-arg VITE_BACKEND_URL="${VITE_BACKEND_URL:-}" \
    --build-arg NODE_ENV=production \
    -t "${IMAGE_NAME}" "${DOCS_DIR}" 2>&1 | tee "${BUILD_LOG}"
fi

BUILD_EXIT=${PIPESTATUS[0]:-0}
if [ "$BUILD_EXIT" -ne 0 ]; then
  echo "❌ docker build failed — see ${BUILD_LOG} for details."
  # show tail for convenience
  tail -n 200 "${BUILD_LOG}" || true
  exit 1
fi

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
# prefer jq if available, else show raw inspect
if command -v jq &>/dev/null; then
  docker inspect "${CONTAINER_NAME}" --format '{{json .Mounts}}' | jq .
else
  docker inspect "${CONTAINER_NAME}" --format '{{json .Mounts}}'
fi

echo "📄 Checking /app/build content inside the container (should exist if build succeeded):"
docker exec "${CONTAINER_NAME}" sh -c "if [ -d /app/build ]; then ls -la /app/build | head -n 50; else echo '/app/build not found'; fi" || true

echo "🧾 Last 200 container logs:"
docker logs "${CONTAINER_NAME}" --tail 200 || true

echo "✅ Documentation rebuild finished successfully."
