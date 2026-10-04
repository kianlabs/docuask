-- Provision a NON-superuser application role.
-- RLS is bypassed by superusers and by roles with BYPASSRLS, regardless of
-- FORCE ROW LEVEL SECURITY. The app must therefore connect as an ordinary role.
--
-- Run as the owner/superuser. Provide the app password explicitly:
--   psql "$ADMIN_URL" -v app_password="$DOCUASK_APP_PASSWORD" -f sql/roles.sql
-- If omitted, a throwaway dev password is used — NEVER use that in production.
--
-- Idempotent: safe to re-run on every deploy. We do NOT `DROP ROLE` (that fails
-- once the role has grants, breaking re-runs under ON_ERROR_STOP); instead we
-- create it only if absent and always (re)set the password.
\if :{?app_password}
\else
\set app_password 'dev_only_change_me'
\endif

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'docuask_app') THEN
    CREATE ROLE docuask_app
      LOGIN
      NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;

ALTER ROLE docuask_app WITH LOGIN PASSWORD :'app_password';

GRANT CONNECT ON DATABASE docuask TO docuask_app;
GRANT USAGE ON SCHEMA public TO docuask_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO docuask_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO docuask_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO docuask_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO docuask_app;
