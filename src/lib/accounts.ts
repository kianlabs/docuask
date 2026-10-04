/**
 * Accounts + orders store.
 *
 * `users` and `orders` are RLS-protected (tenant-scoped). Cross-tenant reads
 * that happen BEFORE a tenant is known (login by email, admin order list) run
 * under the transaction-local `app.is_admin` flag via `withAdmin`. Everything
 * tenant-scoped uses `withTenant`.
 *
 * API keys are generated server-side (never client-chosen) with a `dk_` prefix.
 */

import { randomBytes } from "node:crypto";
import { pool, withAdmin, withTenant, TenantRow } from "./store";
import { hashPassword, verifyPassword } from "./password";
import { upgradePlan, getPlans, getUsage, Usage } from "./billing";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  tenant_id: number;
  is_active: boolean;
  created_at: string;
}

export interface OrderRow {
  id: number;
  order_ref: string;
  tenant_id: number;
  plan_code: string;
  amount_idr: number;
  status: string;
  provider: string | null;
  provider_ref: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export function generateApiKey(): string {
  return `dk_${randomBytes(24).toString("hex")}`;
}

function generateOrderRef(): string {
  return `ord_${randomBytes(10).toString("hex")}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface CreatedAccount {
  userId: number;
  tenantId: number;
  apiKey: string;
}

/** Create a tenant + its owner user in one admin-scoped transaction. */
export async function createAccount(email: string, password: string): Promise<CreatedAccount> {
  const normalized = normalizeEmail(email);
  const name = `account:${normalized.split("@")[0].slice(0, 32)}`;
  const apiKey = generateApiKey();
  const passwordHash = hashPassword(password);

  return withAdmin(async (c) => {
    const tenantRes = await c.query<{ id: number }>(
      `INSERT INTO tenants (name, api_key) VALUES ($1, $2) RETURNING id`,
      [name, apiKey]
    );
    const tenantId = tenantRes.rows[0].id;
    const userRes = await c.query<{ id: number }>(
      `INSERT INTO users (email, password_hash, tenant_id) VALUES ($1, $2, $3) RETURNING id`,
      [normalized, passwordHash, tenantId]
    );
    return { userId: userRes.rows[0].id, tenantId, apiKey };
  });
}

export interface LoginRecord {
  userId: number;
  tenantId: number;
  passwordHash: string;
  isActive: boolean;
}

/** Look up a login by email (admin scope — tenant is not known yet). */
export async function findLoginByEmail(email: string): Promise<LoginRecord | null> {
  const normalized = normalizeEmail(email);
  return withAdmin(async (c) => {
    const res = await c.query<{
      id: number;
      tenant_id: number;
      password_hash: string;
      is_active: boolean;
    }>(
      `SELECT id, tenant_id, password_hash, is_active FROM users WHERE email = $1`,
      [normalized]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      userId: row.id,
      tenantId: row.tenant_id,
      passwordHash: row.password_hash,
      isActive: row.is_active,
    };
  });
}

export function verifyLogin(password: string, storedHash: string): boolean {
  return verifyPassword(password, storedHash);
}

/** Resolve a tenant by id (tenants has no RLS). */
export async function getTenantById(tenantId: number): Promise<TenantRow | null> {
  const res = await pool().query<TenantRow>(`SELECT * FROM tenants WHERE id = $1`, [tenantId]);
  return res.rows[0] ?? null;
}

export interface AccountDashboard {
  email: string;
  tenantId: number;
  apiKey: string;
  planCode: string;
  usage: Usage;
  orders: OrderRow[];
}

/** Everything the /account dashboard renders, in one round of queries. */
export async function getAccountDashboard(tenantId: number): Promise<AccountDashboard | null> {
  const [tenant, account, usage, orders] = await Promise.all([
    getTenantById(tenantId),
    withTenant(tenantId, async (c) => {
      const res = await c.query<UserRow>(`SELECT * FROM users WHERE tenant_id = $1 LIMIT 1`, [
        tenantId,
      ]);
      return res.rows[0] ?? null;
    }),
    getUsage(tenantId),
    listOrders(tenantId),
  ]);
  if (!tenant || !account) return null;
  return {
    email: account.email,
    tenantId,
    apiKey: tenant.api_key,
    planCode: usage.plan.code,
    usage,
    orders,
  };
}

/** Rotate a tenant's API key and return the new value. */
export async function rotateApiKey(tenantId: number): Promise<string> {
  const apiKey = generateApiKey();
  await withTenant(tenantId, async (c) => {
    await c.query(`UPDATE tenants SET api_key = $2 WHERE id = $1`, [tenantId, apiKey]);
  });
  return apiKey;
}

/* --------------------------------- orders -------------------------------- */

export async function createOrder(tenantId: number, planCode: string): Promise<OrderRow> {
  const plans = await getPlans();
  const plan = plans.find((p) => p.code === planCode);
  if (!plan) throw new Error(`unknown plan: ${planCode}`);
  if (plan.price_idr <= 0) throw new Error("plan is not purchasable");
  const orderRef = generateOrderRef();
  return withTenant(tenantId, async (c) => {
    const res = await c.query<OrderRow>(
      `INSERT INTO orders (order_ref, tenant_id, plan_code, amount_idr, provider)
       VALUES ($1, $2, $3, $4, 'manual') RETURNING *`,
      [orderRef, tenantId, planCode, plan.price_idr]
    );
    return res.rows[0];
  });
}

export async function listOrders(tenantId: number): Promise<OrderRow[]> {
  return withTenant(tenantId, async (c) => {
    const res = await c.query<OrderRow>(
      `SELECT * FROM orders WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId]
    );
    return res.rows;
  });
}

/** Admin: every order, newest first. */
export async function listAllOrders(): Promise<OrderRow[]> {
  return withAdmin(async (c) => {
    const res = await c.query<OrderRow>(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`);
    return res.rows;
  });
}

/**
 * Mark an order paid (idempotent) and upgrade the tenant's plan.
 * Returns the order, or null if the ref is unknown.
 */
export async function markOrderPaid(
  orderRef: string,
  providerRef?: string | null
): Promise<OrderRow | null> {
  const order = await withAdmin(async (c) => {
    const res = await c.query<OrderRow>(
      `UPDATE orders
       SET status = 'paid',
           paid_at = now(),
           updated_at = now(),
           provider_ref = COALESCE($2, provider_ref)
       WHERE order_ref = $1
       RETURNING *`,
      [orderRef, providerRef ?? null]
    );
    return res.rows[0] ?? null;
  });
  if (!order) return null;
  // upgradePlan is idempotent, so re-marking an already-paid order is harmless.
  await upgradePlan(order.tenant_id, order.plan_code);
  return order;
}

export async function cancelOrder(tenantId: number, orderRef: string): Promise<OrderRow | null> {
  return withTenant(tenantId, async (c) => {
    const res = await c.query<OrderRow>(
      `UPDATE orders SET status = 'cancelled', updated_at = now()
       WHERE order_ref = $1 AND tenant_id = $2 AND status = 'pending'
       RETURNING *`,
      [orderRef, tenantId]
    );
    return res.rows[0] ?? null;
  });
}
