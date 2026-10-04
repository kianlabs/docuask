-- Provision a NON-superuser application role.
-- RLS is bypassed by superusers and by roles with BYPASSRLS, regardless of
-- FORCE ROW LEVEL SECURITY. The app must therefore connect as an ordinary role.
-- Run as the owner/superuser:  psql "$ADMIN_URL" -f sql/roles.sql

DROP ROLE IF EXISTS docuask_app;
CREATE ROLE docuask_app
  LOGIN PASSWORD 'docuask_app_pw'
  NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;

GRANT CONNECT ON DATABASE docuask TO docuask_app;
GRANT USAGE ON SCHEMA public TO docuask_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO docuask_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO docuask_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO docuask_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO docuask_app;
