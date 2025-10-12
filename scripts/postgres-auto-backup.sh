#!/bin/bash

# PostgreSQL Automatic Backup Script
# This script runs inside PostgreSQL container via cron
# ===========================================

set -euo pipefail

# Configuration
BACKUP_DIR="/var/lib/postgresql/backups"
DB_NAME="mydb"
DB_USER="postgres"
MAX_BACKUPS=3
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/mydb_backup_${DATE}.sql"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting PostgreSQL backup process..."

# Create backup
log "Creating backup: $BACKUP_FILE"
if pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose --no-password > "$BACKUP_FILE" 2>>"$LOG_FILE"; then
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
        log "ERROR: Failed to compress backup"
        exit 1
    fi
else
    log "ERROR: Backup creation failed!"
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

log "Backup process completed successfully!"
exit 0
