# PostgreSQL with Automatic Backups
FROM postgres:15

# Install cron
RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*

# Create backup directory
RUN mkdir -p /var/lib/postgresql/backups

# Copy backup script
COPY scripts/postgres-auto-backup.sh /usr/local/bin/postgres-backup.sh
RUN chmod +x /usr/local/bin/postgres-backup.sh

# Create cron job for daily backups at 2:00 AM
RUN echo "0 2 * * * /usr/local/bin/postgres-backup.sh >> /var/lib/postgresql/backups/cron.log 2>&1" | crontab -

# Start cron service
RUN service cron start

# Create custom entrypoint script
COPY scripts/postgres-entrypoint.sh /usr/local/bin/postgres-entrypoint.sh
RUN chmod +x /usr/local/bin/postgres-entrypoint.sh

# Use custom entrypoint
ENTRYPOINT ["/usr/local/bin/postgres-entrypoint.sh"]
CMD ["postgres"]
