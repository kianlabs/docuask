-- DocuAsk schema — multi-tenant with Row-Level Security.
-- Run once against the docuask database:
--   psql "$DATABASE_URL" -f sql/schema.sql

CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------- tenants --
CREATE TABLE IF NOT EXISTS tenants (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  api_key    TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------- documents --
CREATE TABLE IF NOT EXISTS documents (
  id          SERIAL PRIMARY KEY,
  tenant_id   INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  pages       INTEGER NOT NULL,
  chunks      INTEGER NOT NULL,
  embed_model TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);

-- ----------------------------------------------------------------- chunks --
-- Embedding dim is fixed at 1024 (Cloudflare bge-m3 and the hash fallback are
-- both 1024-dim). If you switch to an embedder with a different dimension you
-- must re-create this column/schema accordingly — a dimension mismatch is a
-- hard error, which is the point: silent mixing is worse than a loud failure.
CREATE TABLE IF NOT EXISTS chunks (
  id          SERIAL PRIMARY KEY,
  tenant_id   INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page        INTEGER NOT NULL,
  idx         INTEGER NOT NULL,
  text        TEXT NOT NULL,
  embedding   vector(1024) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chunks_tenant ON chunks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(document_id);

-- Approximate nearest-neighbour index (cosine). HNSW works well for the
-- corpus sizes this app targets and needs no training data.
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON chunks USING hnsw (embedding vector_cosine_ops);

-- ------------------------------------------------------------------ RLS ---
-- Defense in depth: even if application code forgets `WHERE tenant_id = ...`,
-- the database refuses to return another tenant's rows. The app sets
-- `app.tenant_id` per transaction (see store.ts withTenant()).
--
-- FORCE is essential: the table owner (the `docuask` role the app connects as)
-- BYPASSES RLS unless FORCE is set. Without it, isolation would rest only on
-- application-level WHERE clauses — verified broken with the RLS tests.
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
ALTER TABLE chunks    FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_documents ON documents;
CREATE POLICY tenant_isolation_documents ON documents
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::int);

DROP POLICY IF EXISTS tenant_isolation_chunks ON chunks;
CREATE POLICY tenant_isolation_chunks ON chunks
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::int);

-- Note: `current_setting('app.tenant_id', true)` returns NULL when unset, and
-- `tenant_id = NULL` is never true, so an unset context returns zero rows —
-- fail-closed, not fail-open. The NULLIF(..., '') is required because a pooled
-- connection can leave the setting as an empty string, and casting '' to int
-- raises 22P02 (see PITFALLS in STATUS.md).

-- ------------------------------------------------------------ demo_usage ---
-- Durable daily budget for the public demo endpoint. Deliberately NOT
-- tenant-scoped and NOT under RLS: it holds no customer data, only a per-day
-- request count that bounds unauthenticated LLM spend. The in-memory rate
-- limiter alone resets per instance, so this table is the real ceiling.
--
-- Two tables, two caps: `demo_usage` is the global ceiling; `demo_usage_ip`
-- stops one caller from draining the global budget and locking everyone else
-- out. `ip` is a salted hash of the client IP (no raw IP is stored).
CREATE TABLE IF NOT EXISTS demo_usage (
  day   DATE PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS demo_usage_ip (
  day   DATE NOT NULL,
  ip    TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, ip)
);

-- Explicit grants, but only if the app role already exists. schema.sql is
-- applied BEFORE roles.sql (README, DEPLOY.md, docker-compose, CI) and CI runs
-- it without roles.sql at all, so a bare `GRANT ... TO docuask_app` would abort
-- the whole migration with "role does not exist" under ON_ERROR_STOP=1.
-- roles.sql already grants ON ALL TABLES, so this block is belt-and-braces for
-- the case where schema.sql is re-run after roles.sql.
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'docuask_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON demo_usage    TO docuask_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON demo_usage_ip TO docuask_app;
  END IF;
END
$$;
