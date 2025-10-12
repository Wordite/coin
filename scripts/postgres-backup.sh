#!/bin/bash

# PostgreSQL Backup Script with Rotation
# ===========================================
# This script creates daily backups of PostgreSQL database
# and keeps only the last 3 backup files

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_PATH:-/home/wordite/projects/coin_presale/postgres/backups}"
DB_NAME="mydb"
DB_USER="postgres"
CONTAINER_NAME="postgres"
MAX_BACKUPS=3
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/mydb_backup_${DATE}.sql"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "Starting PostgreSQL backup process..."

# Check if PostgreSQL container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    error "PostgreSQL container '$CONTAINER_NAME' is not running!"
    exit 1
fi

log "PostgreSQL container is running"

# Check if database exists
if ! docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    error "Database '$DB_NAME' does not exist!"
    exit 1
fi

log "Database '$DB_NAME' exists"

# Create backup
log "Creating backup: $BACKUP_FILE"
if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose --no-password > "$BACKUP_FILE" 2>>"$LOG_FILE"; then
    log "Backup created successfully: $BACKUP_FILE"
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup size: $BACKUP_SIZE"
    
    # Compress backup
    log "Compressing backup..."
    if gzip "$BACKUP_FILE"; then
        COMPRESSED_FILE="${BACKUP_FILE}.gz"
        COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
        log "Backup compressed successfully: $COMPRESSED_FILE ($COMPRESSED_SIZE)"
    else
        error "Failed to compress backup"
        exit 1
    fi
else
    error "Backup creation failed!"
    exit 1
fi

# Rotate old backups (keep only last 3)
log "Rotating old backups (keeping last $MAX_BACKUPS files)..."
cd "$BACKUP_DIR"
BACKUP_COUNT=$(ls -1 mydb_backup_*.sql.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    FILES_TO_DELETE=$((BACKUP_COUNT - MAX_BACKUPS))
    log "Found $BACKUP_COUNT backup files, removing oldest $FILES_TO_DELETE files"
    
    # Remove oldest files
    ls -1t mydb_backup_*.sql.gz | tail -n "$FILES_TO_DELETE" | while read -r file; do
        log "Removing old backup: $file"
        rm -f "$file"
    done
else
    log "Backup count ($BACKUP_COUNT) is within limit ($MAX_BACKUPS)"
fi

# List current backups
log "Current backup files:"
ls -lh mydb_backup_*.sql.gz 2>/dev/null | while read -r line; do
    log "  $line"
done

log "Backup process completed successfully!"

Optional: Send notification (uncomment if needed)
if command -v curl >/dev/null 2>&1; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ PostgreSQL backup completed: $COMPRESSED_FILE ($COMPRESSED_SIZE)\"}" \
        "$WEBHOOK_URL" 2>/dev/null || true
fi

exit 0
