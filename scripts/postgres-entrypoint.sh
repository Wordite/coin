#!/bin/bash

# PostgreSQL Custom Entrypoint with Backup Support
# ===========================================

set -e

# Start cron service
echo "Starting cron service..."
service cron start

# Ensure cron is running
if ! pgrep cron > /dev/null; then
    echo "ERROR: Failed to start cron service"
    exit 1
fi

echo "Cron service started successfully"

# Show cron jobs
echo "Active cron jobs:"
crontab -l

# Create backup directory with proper permissions
mkdir -p /var/lib/postgresql/backups
chown postgres:postgres /var/lib/postgresql/backups
chmod 755 /var/lib/postgresql/backups

echo "Backup directory created: /var/lib/postgresql/backups"

# Run the original PostgreSQL entrypoint
echo "Starting PostgreSQL..."
exec /usr/local/bin/docker-entrypoint.sh "$@"
