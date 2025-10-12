-- PostgreSQL Security Setup Script
-- This script creates secure users with appropriate permissions

-- Create a dedicated user for backend application (full DDL/DML access)
CREATE USER backend_user WITH PASSWORD 'BackendSecure2024!@#';

-- Grant connection permission to mydb database
GRANT CONNECT ON DATABASE mydb TO backend_user;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO backend_user;

-- Grant CREATE permission on schema (backend can create tables)
GRANT CREATE ON SCHEMA public TO backend_user;

-- Grant all privileges on all existing tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO backend_user;

-- Grant all privileges on all existing sequences in public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO backend_user;

-- Grant privileges on future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO backend_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO backend_user;

-- Grant ownership of future objects to backend_user
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO backend_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO backend_user;

-- Create readonly user for postgres (admin monitoring)
CREATE USER postgres_readonly WITH PASSWORD 'PostgresReadOnly2024!@#';

-- Grant connection permission to mydb database
GRANT CONNECT ON DATABASE mydb TO postgres_readonly;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO postgres_readonly;

-- Grant SELECT permission on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres_readonly;

-- Grant SELECT permission on all existing sequences
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres_readonly;

-- Grant SELECT permission on future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO postgres_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO postgres_readonly;

-- Remove dangerous permissions from postgres user (make it readonly)
REVOKE CREATE ON SCHEMA public FROM postgres;
REVOKE CREATE ON DATABASE mydb FROM postgres;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM postgres;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM postgres;

-- Grant only SELECT permissions to postgres user
GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;

-- Grant SELECT permissions on future objects to postgres
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO postgres;

-- Log the setup
-- INSERT INTO pg_stat_statements_info VALUES ('PostgreSQL security setup completed', now());
