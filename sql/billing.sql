-- Billing: plans, per-tenant subscription, usage events.
-- Run after sql/schema.sql:  psql "$DATABASE_URL" -f sql/billing.sql

-- ------------------------------------------------------------------ plans --
CREATE TABLE IF NOT EXISTS plans (
  code           TEXT PRIMARY KEY,          -- 'free' | 'pro' | 'bisnis'
  name           TEXT NOT NULL,
  price_idr      INTEGER NOT NULL DEFAULT 0,
  max_documents  INTEGER,                   -- NULL = unlimited
  max_questions  INTEGER,                   -- per billing period
  is_active      BOOLEAN NOT NULL DEFAULT true,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

INSERT INTO plans (code, name, price_idr, max_documents, max_questions, sort_order)
VALUES
  ('free',   'Gratis',  0,      3,   50,   1),
  ('pro',    'Pro',     99000,  50,  2000, 2),
  ('bisnis', 'Bisnis',  499000, NULL, NULL, 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  price_idr = EXCLUDED.price_idr,
  max_documents = EXCLUDED.max_documents,
  max_questions = EXCLUDED.max_questions,
  sort_order = EXCLUDED.sort_order;

-- ------------------------------------------------ subscription on tenants --
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_code TEXT NOT NULL DEFAULT 'free'
  REFERENCES plans(code);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS period_start TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active';
  -- 'active' | 'past_due' | 'cancelled'

-- --------------------------------------------------------------- usage -----
-- One row per metered operation. Kept as events (not just counters) so monthly
-- rollups, auditing, and per-operation debugging are all possible.
CREATE TABLE IF NOT EXISTS usage_events (
  id          BIGSERIAL PRIMARY KEY,
  tenant_id   INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,        -- 'ingest' | 'question'
  units       BIGINT NOT NULL DEFAULT 1,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usage_tenant_time ON usage_events(tenant_id, created_at DESC);

-- Current counter state per tenant (cheap reads for quota checks).
-- NOTE: only `questions` is a true monthly counter. The documents quota is
-- derived from COUNT(*) on the `documents` table (the source of truth), so the
-- `documents` column here is informational only and never drives quota checks.
CREATE TABLE IF NOT EXISTS usage_counters (
  tenant_id     INTEGER PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  period_start  TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
  documents     INTEGER NOT NULL DEFAULT 0,
  questions     INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- RLS -------
-- Tenants may see their own usage; plans are world-readable reference data.
ALTER TABLE usage_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events   FORCE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_usage_events ON usage_events;
CREATE POLICY tenant_isolation_usage_events ON usage_events
  USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::int
    OR current_setting('app.is_admin', true) = 'on'
  );

DROP POLICY IF EXISTS tenant_isolation_usage_counters ON usage_counters;
CREATE POLICY tenant_isolation_usage_counters ON usage_counters
  USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::int
    OR current_setting('app.is_admin', true) = 'on'
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON usage_events TO docuask_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON usage_counters TO docuask_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON plans TO docuask_app;
GRANT USAGE, SELECT ON SEQUENCE usage_events_id_seq TO docuask_app;
