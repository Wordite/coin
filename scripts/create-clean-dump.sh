#!/bin/bash

# Script to create a clean database dump excluding temporary/junk data
# Excludes: sessions, authorization_requests, activation_links, media, contacts

set -e

echo "🗄️ Creating clean database dump..."

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-mydb}
DB_USER=${DB_USER:-postgres}

# Output file
OUTPUT_FILE="database_clean_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "📊 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo "🌐 Host: $DB_HOST:$DB_PORT"
echo "📁 Output: $OUTPUT_FILE"

# Tables to exclude (temporary/junk data)
EXCLUDE_TABLES=(
    "sessions"
    "authorization_requests" 
    "activation_links"
    "media"
    "contacts"
    "users"
)

# Build exclude string for pg_dump
EXCLUDE_STRING=""
for table in "${EXCLUDE_TABLES[@]}"; do
    EXCLUDE_STRING="$EXCLUDE_STRING --exclude-table-data=$table"
done

echo "🚫 Excluding tables: ${EXCLUDE_TABLES[*]}"

# Create the dump
echo "⏳ Creating dump..."
pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    --no-owner \
    --no-privileges \
    $EXCLUDE_STRING \
    > "$OUTPUT_FILE"

echo "✅ Dump created successfully: $OUTPUT_FILE"

# Show file size
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
echo "📏 File size: $FILE_SIZE"

# Show included tables
echo "📋 Included tables:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name NOT IN ('sessions', 'authorization_requests', 'activation_links', 'media', 'contacts', 'users')
ORDER BY table_name;
"

echo "🎉 Clean database dump completed!"
echo "💡 To restore: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres < $OUTPUT_FILE"
