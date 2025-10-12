#!/bin/bash

# PostgreSQL Security Setup Script
# This script sets up secure database access with limited permissions

echo "🔐 Setting up PostgreSQL security..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec postgres pg_isready -U postgres; do
  echo "PostgreSQL is not ready yet..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Create the database if it doesn't exist
echo "📊 Creating database 'mydb' if it doesn't exist..."
docker exec postgres psql -U postgres -c "CREATE DATABASE mydb;" 2>/dev/null || echo "Database 'mydb' already exists"

# Run the security setup script
echo "🛡️ Setting up secure user permissions..."
docker exec -i postgres psql -U postgres -d mydb < scripts/setup-secure-postgres.sql

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL security setup completed successfully!"
    echo ""
    echo "📋 Security Summary:"
    echo "  - postgres user: Read-only access (monitoring only)"
    echo "  - backend_user: Full DDL/DML access (can create/manage tables)"
    echo "  - postgres_readonly: Read-only access (alternative monitoring)"
    echo ""
    echo "🔑 Database URLs:"
    echo "  Backend (Full Access): postgresql://backend_user:BackendSecure2024!@#@postgres:5432/mydb"
    echo "  Admin (Read-Only): postgresql://postgres:m0BdDXKfxnJFTsPCtoXar4uxf9XxuDePU2WLozG4sKk=@postgres:5432/mydb"
    echo "  Monitoring (Read-Only): postgresql://postgres_readonly:PostgresReadOnly2024!@#@postgres:5432/mydb"
else
    echo "❌ PostgreSQL security setup failed!"
    exit 1
fi
