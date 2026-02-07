#!/bin/bash
# Server startup script - ensures all Docker containers are running after reboot
# Add to crontab: @reboot sleep 30 && /home/coin/scripts/startup.sh >> /var/log/coin-startup.log 2>&1

set -euo pipefail

# Configuration
PROJECT_PATH="${PROJECT_PATH:-/home/coin}"
LOG_FILE="${LOG_FILE:-/var/log/coin-startup.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Wait for Docker to be ready
wait_for_docker() {
    log "Waiting for Docker daemon to be ready..."
    local max_attempts=30
    local attempt=0

    while ! docker info >/dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ $attempt -ge $max_attempts ]; then
            log "${RED}Docker daemon not ready after ${max_attempts} attempts${NC}"
            return 1
        fi
        log "Waiting for Docker... (attempt $attempt/$max_attempts)"
        sleep 2
    done

    log "${GREEN}Docker daemon is ready${NC}"
    return 0
}

# Check if containers are running
check_containers() {
    local required_containers="nginx backend postgres redis vault frontend admin docs app"
    local all_running=true

    for container in $required_containers; do
        if ! docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            log "${YELLOW}Container '${container}' is not running${NC}"
            all_running=false
        fi
    done

    if [ "$all_running" = true ]; then
        return 0
    else
        return 1
    fi
}

# Start docker-compose
start_containers() {
    log "Starting Docker Compose services..."

    cd "$PROJECT_PATH"

    if [ ! -f ".env.prod" ]; then
        log "${RED}.env.prod file not found${NC}"
        return 1
    fi

    # Get Docker GID for socket access
    DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)
    echo "DOCKER_GID=$DOCKER_GID" >> .env.prod 2>/dev/null || true

    # Start all services
    docker compose -f docker-compose.yml --env-file .env.prod up -d

    # Wait for services to start
    log "Waiting for services to initialize..."
    sleep 15

    return 0
}

# Wait for specific service to be healthy
wait_for_service() {
    local service=$1
    local max_attempts=${2:-30}
    local attempt=0

    log "Waiting for $service to be ready..."

    while ! docker ps --format '{{.Names}}' | grep -q "^${service}$"; do
        attempt=$((attempt + 1))
        if [ $attempt -ge $max_attempts ]; then
            log "${RED}$service not ready after ${max_attempts} attempts${NC}"
            return 1
        fi
        sleep 2
    done

    log "${GREEN}$service is running${NC}"
    return 0
}

# Verify docs container specifically
verify_docs() {
    log "Verifying docs container..."

    if ! docker ps --format '{{.Names}}' | grep -q "^docs$"; then
        log "${YELLOW}Docs container not running, attempting to start...${NC}"

        cd "$PROJECT_PATH"
        docker compose -f docker-compose.yml --env-file .env.prod up -d docs
        sleep 10
    fi

    # Check if docs is responding
    local docs_status=$(docker inspect --format='{{.State.Status}}' docs 2>/dev/null || echo "not_found")

    if [ "$docs_status" = "running" ]; then
        log "${GREEN}Docs container is running${NC}"

        # Show last logs
        log "Docs container logs (last 20 lines):"
        docker logs docs --tail 20 2>&1 | while read line; do log "  $line"; done

        return 0
    else
        log "${RED}Docs container status: $docs_status${NC}"

        # Try to restart it
        log "Attempting to restart docs container..."
        docker compose -f docker-compose.yml --env-file .env.prod up -d --force-recreate docs
        sleep 10

        docs_status=$(docker inspect --format='{{.State.Status}}' docs 2>/dev/null || echo "not_found")
        if [ "$docs_status" = "running" ]; then
            log "${GREEN}Docs container restarted successfully${NC}"
            return 0
        else
            log "${RED}Failed to start docs container${NC}"
            docker logs docs --tail 50 2>&1 | while read line; do log "  $line"; done
            return 1
        fi
    fi
}

# Main execution
main() {
    log "=========================================="
    log "Starting server initialization..."
    log "=========================================="

    # Wait for Docker
    if ! wait_for_docker; then
        log "${RED}Failed to connect to Docker daemon${NC}"
        exit 1
    fi

    # Check if containers are already running
    if check_containers; then
        log "${GREEN}All containers are already running${NC}"
    else
        log "Some containers not running, starting docker-compose..."
        if ! start_containers; then
            log "${RED}Failed to start containers${NC}"
            exit 1
        fi
    fi

    # Wait for critical services
    wait_for_service "postgres" 30
    wait_for_service "redis" 30
    wait_for_service "vault" 30
    wait_for_service "backend" 30

    # Verify docs specifically
    verify_docs

    # Unseal Vault if needed
    if [ -x "$PROJECT_PATH/scripts/vault-auto-unseal.sh" ]; then
        log "Running Vault auto-unseal..."
        "$PROJECT_PATH/scripts/vault-auto-unseal.sh" || log "${YELLOW}Vault unseal had issues${NC}"
    fi

    # Final status
    log "=========================================="
    log "Final container status:"
    log "=========================================="
    docker compose -f "$PROJECT_PATH/docker-compose.yml" ps 2>&1 | while read line; do log "  $line"; done

    log "${GREEN}Startup script completed${NC}"
}

# Run main function
main
