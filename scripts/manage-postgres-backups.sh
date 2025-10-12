#!/bin/bash

# PostgreSQL Backup Management Script
# ===========================================
# This script provides easy access to PostgreSQL backups

set -euo pipefail

# Configuration
CONTAINER_NAME="postgres"
BACKUP_DIR="/var/lib/postgresql/backups"
LOCAL_BACKUP_DIR="${BACKUP_PATH:-/home/wordite/projects/coin_presale/postgres/backups}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Function to show usage
usage() {
    echo "PostgreSQL Backup Management Script"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  list                    List all backup files"
    echo "  latest                  Show latest backup info"
    echo "  download <backup_file>  Download backup to local directory"
    echo "  restore <backup_file>   Restore database from backup"
    echo "  logs                    Show backup logs"
    echo "  cron                    Show cron job status"
    echo "  manual                  Create manual backup"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 download mydb_backup_20241211_143022.sql.gz"
    echo "  $0 restore mydb_backup_20241211_143022.sql.gz"
    echo "  $0 manual"
}

# Check if PostgreSQL container is running
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        error "PostgreSQL container '$CONTAINER_NAME' is not running!"
        exit 1
    fi
}

# List backup files
list_backups() {
    log "Listing backup files..."
    docker exec "$CONTAINER_NAME" ls -lah "$BACKUP_DIR" | grep "mydb_backup" || echo "No backup files found"
}

# Show latest backup info
show_latest() {
    log "Latest backup information..."
    LATEST_BACKUP=$(docker exec "$CONTAINER_NAME" ls -t "$BACKUP_DIR"/mydb_backup_*.sql.gz 2>/dev/null | head -1 || echo "")
    
    if [ -z "$LATEST_BACKUP" ]; then
        warning "No backup files found"
        return
    fi
    
    log "Latest backup: $LATEST_BACKUP"
    docker exec "$CONTAINER_NAME" ls -lah "$BACKUP_DIR/$LATEST_BACKUP"
}

# Download backup to local directory
download_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Backup file name is required"
        return 1
    fi
    
    log "Downloading backup: $backup_file"
    
    # Create local backup directory
    mkdir -p "$LOCAL_BACKUP_DIR"
    
    # Copy backup from container
    if docker cp "$CONTAINER_NAME:$BACKUP_DIR/$backup_file" "$LOCAL_BACKUP_DIR/"; then
        log "Backup downloaded successfully to: $LOCAL_BACKUP_DIR/$backup_file"
        ls -lah "$LOCAL_BACKUP_DIR/$backup_file"
    else
        error "Failed to download backup"
        return 1
    fi
}

# Restore database from backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Backup file name is required"
        return 1
    fi
    
    warning "This will REPLACE all data in database 'mydb'!"
    echo -n "Are you sure you want to continue? (yes/no): "
    read -r confirmation
    
    if [ "$confirmation" != "yes" ]; then
        log "Restore operation cancelled"
        return 0
    fi
    
    log "Restoring database from: $backup_file"
    
    # Create temporary database for restore
    TEMP_DB="mydb_restore_$(date +%s)"
    log "Creating temporary database: $TEMP_DB"
    
    docker exec "$CONTAINER_NAME" psql -U postgres -c "CREATE DATABASE $TEMP_DB;"
    
    # Restore to temporary database
    log "Restoring backup to temporary database..."
    if [[ "$backup_file" == *.gz ]]; then
        docker exec "$CONTAINER_NAME" gunzip -c "$BACKUP_DIR/$backup_file" | docker exec -i "$CONTAINER_NAME" psql -U postgres -d "$TEMP_DB"
    else
        docker exec -i "$CONTAINER_NAME" psql -U postgres -d "$TEMP_DB" < "$BACKUP_DIR/$backup_file"
    fi
    
    # Replace original database
    log "Replacing original database..."
    docker exec "$CONTAINER_NAME" psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'mydb' AND pid <> pg_backend_pid();"
    docker exec "$CONTAINER_NAME" psql -U postgres -c "DROP DATABASE IF EXISTS mydb;"
    docker exec "$CONTAINER_NAME" psql -U postgres -c "CREATE DATABASE mydb;"
    docker exec "$CONTAINER_NAME" pg_dump -U postgres -d "$TEMP_DB" | docker exec -i "$CONTAINER_NAME" psql -U postgres -d mydb
    docker exec "$CONTAINER_NAME" psql -U postgres -c "DROP DATABASE $TEMP_DB;"
    
    log "Database restore completed successfully!"
}

# Show backup logs
show_logs() {
    log "Backup logs:"
    docker exec "$CONTAINER_NAME" tail -50 "$BACKUP_DIR/backup.log" 2>/dev/null || echo "No backup logs found"
    
    echo ""
    log "Cron logs:"
    docker exec "$CONTAINER_NAME" tail -20 "$BACKUP_DIR/cron.log" 2>/dev/null || echo "No cron logs found"
}

# Show cron job status
show_cron() {
    log "Cron job status:"
    docker exec "$CONTAINER_NAME" crontab -l
    
    echo ""
    log "Cron service status:"
    docker exec "$CONTAINER_NAME" service cron status
}

# Create manual backup
create_manual_backup() {
    log "Creating manual backup..."
    docker exec "$CONTAINER_NAME" /usr/local/bin/postgres-backup.sh
    
    if [ $? -eq 0 ]; then
        log "Manual backup created successfully!"
        show_latest
    else
        error "Manual backup failed!"
        return 1
    fi
}

# Main script logic
main() {
    case "${1:-}" in
        "list")
            check_container
            list_backups
            ;;
        "latest")
            check_container
            show_latest
            ;;
        "download")
            check_container
            download_backup "$2"
            ;;
        "restore")
            check_container
            restore_backup "$2"
            ;;
        "logs")
            check_container
            show_logs
            ;;
        "cron")
            check_container
            show_cron
            ;;
        "manual")
            check_container
            create_manual_backup
            ;;
        *)
            usage
            ;;
    esac
}

# Run main function with all arguments
main "$@"
