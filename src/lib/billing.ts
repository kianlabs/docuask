/**
 * Billing — plans, quota checks, usage metering.
 *
 * Model: each tenant has a plan (free/pro/bisnis) with monthly limits on
 * documents ingested and questions asked. Every metered operation writes a
 * `usage_events` row and bumps `usage_counters`. Quota is checked BEFORE the
 * work happens, so an over-quota tenant gets a 402-style answer without us
 * paying for an LLM call.
 *
 * RLS NOTE: `usage_events` and `usage_counters` are protected by row-level
 * security, so every statement touching them MUST run with `app.tenant_id`
 * set. Use `withTenant()` from ./store — calling pool().query() directly will
 * fail with "new row violates row-level security policy". `plans` is
 * world-readable reference data and needs no tenant context.
 *
 * Payment gateway is intentionally NOT wired here — `upgradePlan()` is a mock
 * that flips the tenant's plan. Swapping in Midtrans/Xendit means: on their
 * webhook, call `setPlanFromPayment(tenantId, planCode)` instead.
 */

import { pool, withTenant, withAdmin } from "./store";

export interface Plan {
  code: string;
  name: string;
  price_idr: number;
  max_documents: number | null;
  max_questions: number | null;
  sort_order: number;
}

export interface Usage {
  periodStart: string;
  documents: number;
  questions: number;
  plan: Plan;
  remainingDocuments: number | null; // null = unlimited
  remainingQuestions: number | null;
  subscriptionStatus: string;
}

export class QuotaExceededError extends Error {
  metric: "documents" | "questions";
  limit: number;
  used: number;
  constructor(metric: "documents" | "questions", limit: number, used: number) {
    super(
      metric === "documents"
        ? `Kuota dokumen habis (${used}/${limit} bulan ini). Upgrade paket untuk lanjut.`
        : `Kuota pertanyaan habis (${used}/${limit} bulan ini). Upgrade paket untuk lanjut.`
    );
    this.name = "QuotaExceededError";
    this.metric = metric;
    this.limit = limit;
    this.used = used;
  }
}

export async function getPlans(): Promise<Plan[]> {
  const res = await pool().query<Plan>(
    `SELECT code, name, price_idr, max_documents, max_questions, sort_order
     FROM plans WHERE is_active = true ORDER BY sort_order`
  );
  return res.rows;
}

/**
 * Authoritative document count for a tenant.
 *
 * The `documents` table is the source of truth — NOT `usage_counters.documents`.
 * A monthly counter would reset each period while the stored documents persist,
 * letting a tenant re-upload past its plan limit every month (and desyncing from
 * reality if a document is ever deleted). Counting the table keeps the quota
 * honest: it can never disagree with what is actually stored.
 */
async function countDocuments(tenantId: number): Promise<number> {
  return withTenant(tenantId, async (c) => {
    const res = await c.query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM documents WHERE tenant_id = $1`,
      [tenantId]
    );
    return Number(res.rows[0].n);
  });
}

/** Ensure a counter row exists and is on the current month. */
async function ensureCounter(tenantId: number): Promise<void> {
  await withTenant(tenantId, async (c) => {
    await c.query(
      `INSERT INTO usage_counters (tenant_id, period_start)
       VALUES ($1, date_trunc('month', now()))
       ON CONFLICT (tenant_id) DO UPDATE
         SET documents = 0, questions = 0,
             period_start = date_trunc('month', now()),
             updated_at = now()
       WHERE usage_counters.period_start < date_trunc('month', now())`,
      [tenantId]
    );
  });
}

interface UsageRow {
  period_start: string;
  questions: number;
  plan_code: string;
  subscription_status: string;
  name: string;
  price_idr: number;
  max_documents: number | null;
  max_questions: number | null;
  sort_order: number;
}

export async function getUsage(tenantId: number): Promise<Usage> {
  await ensureCounter(tenantId);
  const [row, documents] = await Promise.all([
    withTenant(tenantId, async (c) => {
      const res = await c.query<UsageRow>(
        `SELECT u.period_start, u.questions,
                t.plan_code, t.subscription_status,
                p.name, p.price_idr, p.max_documents, p.max_questions, p.sort_order
         FROM usage_counters u
         JOIN tenants t ON t.id = u.tenant_id
         JOIN plans p ON p.code = t.plan_code
         WHERE u.tenant_id = $1`,
        [tenantId]
      );
      return res.rows[0];
    }),
    countDocuments(tenantId),
  ]);
  if (!row) throw new Error(`tenant ${tenantId} not found`);
  const plan: Plan = {
    code: row.plan_code,
    name: row.name,
    price_idr: row.price_idr,
    max_documents: row.max_documents,
    max_questions: row.max_questions,
    sort_order: row.sort_order,
  };
  return {
    periodStart: row.period_start,
    documents,
    questions: row.questions,
    plan,
    remainingDocuments:
      row.max_documents === null ? null : Math.max(0, row.max_documents - documents),
    remainingQuestions:
      row.max_questions === null ? null : Math.max(0, row.max_questions - row.questions),
    subscriptionStatus: row.subscription_status,
  };
}

/** Throw QuotaExceededError if the tenant cannot perform one more `metric`. */
export async function assertQuota(
  tenantId: number,
  metric: "documents" | "questions"
): Promise<Usage> {
  const usage = await getUsage(tenantId);
  if (usage.subscriptionStatus !== "active") {
    throw new QuotaExceededError(metric, 0, 0);
  }
  const limit = metric === "documents" ? usage.plan.max_documents : usage.plan.max_questions;
  const used = metric === "documents" ? usage.documents : usage.questions;
  if (limit !== null && used >= limit) {
    throw new QuotaExceededError(metric, limit, used);
  }
  return usage;
}

/** Record a metered operation (called AFTER the work succeeds). */
export async function recordUsage(
  tenantId: number,
  kind: "ingest" | "question",
  units = 1,
  metadata?: Record<string, unknown>
): Promise<void> {
  await ensureCounter(tenantId);
  await withTenant(tenantId, async (c) => {
    await c.query(
      `INSERT INTO usage_events (tenant_id, kind, units, metadata) VALUES ($1, $2, $3, $4)`,
      [tenantId, kind, units, metadata ? JSON.stringify(metadata) : null]
    );
    // Only `questions` is a true monthly counter. The documents quota is derived
    // from the `documents` table itself (the source of truth), so an ingest only
    // logs an event and never bumps a counter that could drift from reality.
    if (kind === "question") {
      await c.query(
        `UPDATE usage_counters SET questions = questions + $2, updated_at = now()
         WHERE tenant_id = $1`,
        [tenantId, units]
      );
    }
  });
}

/**
 * Apply a plan change. This is the trusted primitive used by BOTH the admin
 * route (operator) and the payment webhook (`/api/webhook/payment`, after
 * signature verification). It deliberately does NOT authenticate — callers
 * must already be authorized. `tenants` has no RLS, so no tenant context needed.
 */
export async function upgradePlan(tenantId: number, planCode: string): Promise<Usage> {
  const plan = await pool().query(`SELECT code FROM plans WHERE code = $1 AND is_active`, [
    planCode,
  ]);
  if (plan.rows.length === 0) throw new Error(`unknown plan: ${planCode}`);
  await pool().query(
    `UPDATE tenants SET plan_code = $2, subscription_status = 'active' WHERE id = $1`,
    [tenantId, planCode]
  );
  return getUsage(tenantId);
}

/** Admin view: every tenant with plan + usage (uses the RLS admin flag). */
export async function adminOverview() {
  const tenants = await withAdmin(async (c) => {
    const res = await c.query<{ id: number } & Record<string, unknown>>(
      `SELECT t.id, t.name, t.api_key, t.plan_code, t.subscription_status, t.created_at,
              COALESCE(u.questions,0) AS questions,
              p.max_documents, p.max_questions, p.price_idr
       FROM tenants t
       LEFT JOIN usage_counters u ON u.tenant_id = t.id
       LEFT JOIN plans p ON p.code = t.plan_code
       ORDER BY t.id`
    );
    return res.rows;
  });
  // `documents` is counted from the source-of-truth table. That table is
  // protected by tenant-only RLS (no admin bypass), so count per tenant under
  // each tenant's own context rather than widening the policy.
  const counts = await Promise.all(tenants.map((t) => countDocuments(t.id)));
  return tenants.map((t, i) => ({ ...t, documents: counts[i] }));
}
