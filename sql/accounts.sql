-- Accounts + orders: self-service signup/login and the order → payment bridge.
-- Run after sql/schema.sql and sql/billing.sql:
--   psql "$DATABASE_URL" -f sql/accounts.sql

-- ------------------------------------------------------------------ users --
-- One login per tenant (an account owns exactly one tenant/API key). Password
-- is stored as a scrypt string; email is stored lowercased so UNIQUE is
-- effectively case-insensitive.
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  tenant_id     INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- ----------------------------------------------------------------- orders --
-- A purchase intent. Gateway-agnostic: `provider`/`provider_ref` stay NULL for
-- the manual flow and are filled once a real gateway (Midtrans/Xendit) is wired.
-- `order_ref` is the public handle a customer/gateway round-trips.
CREATE TABLE IF NOT EXISTS orders (
  id           SERIAL PRIMARY KEY,
  order_ref    TEXT NOT NULL UNIQUE,
  tenant_id    INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_code    TEXT NOT NULL REFERENCES plans(code),
  amount_idr   INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',   -- pending | paid | cancelled | expired
  provider     TEXT,                              -- 'manual' | 'midtrans' | 'xendit'
  provider_ref TEXT,                              -- the gateway's own id
  paid_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- --------------------------------------------------------------- RLS -------
-- Same pattern as billing.sql: a tenant sees only its own rows; the trusted
-- server uses the transaction-local `app.is_admin` flag for cross-tenant reads
-- (login lookup by email, admin order list). Never rely on superuser.
ALTER TABLE users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE users  FORCE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
  USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::int
    OR current_setting('app.is_admin', true) = 'on'
  )
  WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::int
    OR current_setting('app.is_admin', true) = 'on'
  );

DROP POLICY IF EXISTS tenant_isolation_orders ON orders;
CREATE POLICY tenant_isolation_orders ON orders
  USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::int
    OR current_setting('app.is_admin', true) = 'on'
  )
  WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::int
    OR current_setting('app.is_admin', true) = 'on'
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON users  TO docuask_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO docuask_app;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq  TO docuask_app;
GRANT USAGE, SELECT ON SEQUENCE orders_id_seq TO docuask_app;
