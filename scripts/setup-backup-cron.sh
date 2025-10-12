#!/bin/bash

# PostgreSQL Backup Cron Setup Script
# ===========================================
# This script sets up daily automated backups for PostgreSQL

set -euo pipefail

# Configuration
SCRIPT_DIR="/home/wordite/projects/coin_presale/scripts"
BACKUP_SCRIPT="$SCRIPT_DIR/postgres-backup.sh"
BACKUP_DIR="/home/wordite/projects/coin_presale/postgres/backups"
CRON_USER="root"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log "Setting up PostgreSQL backup automation..."

# Check if backup script exists
if [ ! -f "$BACKUP_SCRIPT" ]; then
    error "Backup script '$BACKUP_SCRIPT' does not exist!"
    exit 1
fi

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"
log "Made backup script executable"

# Create backup directory
mkdir -p "$BACKUP_DIR"
log "Created backup directory: $BACKUP_DIR"

# Create cron job entry
CRON_JOB="0 2 * * * $BACKUP_SCRIPT >> $BACKUP_DIR/cron.log 2>&1"

log "Setting up cron job..."
log "Cron job: $CRON_JOB"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "postgres-backup.sh"; then
    warning "Cron job for PostgreSQL backup already exists!"
    echo "Current cron jobs:"
    crontab -l | grep -E "(postgres|backup)" || echo "No PostgreSQL backup cron jobs found"
    echo ""
    echo -n "Do you want to replace it? (yes/no): "
    read -r confirmation
    if [ "$confirmation" != "yes" ]; then
        log "Cron job setup cancelled"
        exit 0
    fi
    
    
    # Remove existing cron job
    crontab -l | grep -v "postgres-backup.sh" | crontab -
    log "Removed existing cron job"
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
log "Added new cron job"

# Verify cron job was added
log "Verifying cron job..."
if crontab -l | grep -q "postgres-backup.sh"; then
    log "✅ Cron job added successfully!"
    echo ""
    log "Current PostgreSQL backup cron jobs:"
    crontab -l | grep "postgres-backup.sh"
else
    error "Failed to add cron job!"
    exit 1
fi

# Test backup script
log "Testing backup script..."
if "$BACKUP_SCRIPT"; then
    log "✅ Backup script test successful!"
else
    error "Backup script test failed!"
    exit 1
fi

echo ""
log "PostgreSQL backup automation setup completed!"
echo ""
log "Summary:"
log "  - Backup script: $BACKUP_SCRIPT"
log "  - Backup directory: $BACKUP_DIR"
log "  - Cron schedule: Daily at 2:00 AM"
log "  - Retention: Last 3 backup files"
log "  - Compression: Enabled (gzip)"
echo ""
log "Manual commands:"
log "  - Run backup: $BACKUP_SCRIPT"
log "  - List backups: ls -la $BACKUP_DIR/"
log "  - Restore backup: $SCRIPT_DIR/postgres-restore.sh [backup_file]"
log "  - View cron logs: tail -f $BACKUP_DIR/cron.log"
echo ""
log "Cron job will run daily at 2:00 AM server time"

exit 0
