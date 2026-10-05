/**
 * Postgres + pgvector store — multi-tenant.
 *
 * Isolation is enforced at TWO levels (defense in depth):
 *   1. Every query takes a tenantId and filters `WHERE tenant_id = $1`.
 *   2. Row-Level Security (RLS): the app sets `app.tenant_id` per transaction,
 *      and RLS policies reject rows from other tenants even if a query forgets
 *      the filter. See `sql/schema.sql`.
 *
 * Retrieval uses pgvector's `<=>` (cosine distance) with the HNSW index.
 * `minScore` is a *similarity* floor: similarity = 1 - distance.
 */

import { Pool, PoolClient } from "pg";
import { cosine } from "./embed";

let _pool: Pool | null = null;

export function pool(): Pool {
  if (_pool) return _pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Fail loud: never fall back to a baked-in credential. See .env.example.
    throw new Error("DATABASE_URL is not set");
  }
  _pool = new Pool({ connectionString, max: 5 });
  return _pool;
}

export interface TenantRow {
  id: number;
  name: string;
  api_key: string;
  created_at: string;
}

export interface IngestChunk {
  page: number;
  idx: number;
  text: string;
  vector: number[];
}

/** Run a function inside a transaction with the RLS tenant context set. */
export async function withTenant<T>(
  tenantId: number,
  fn: (c: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    // set_config(..., true) = local to this transaction
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [
      String(tenantId),
    ]);
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/* -------------------------------- tenants -------------------------------- */
/**
 * Run a function with the RLS admin flag set, so cross-tenant rows are visible.
 * Only ever call this from code paths that have already verified the caller is
 * the operator (see src/lib/admin.ts). The setting is transaction-local.
 */
export async function withAdmin<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.is_admin', 'on', true)");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function getOrCreateTenantByApiKey(
  apiKey: string,
  name = "default"
): Promise<TenantRow | null> {
  const existing = await pool().query<TenantRow>(
    `SELECT * FROM tenants WHERE api_key = $1 AND is_active = true`,
    [apiKey]
  );
  if (existing.rows.length > 0) return existing.rows[0];
  return null;
}

export async function createTenant(
  name: string,
  apiKey: string
): Promise<TenantRow> {
  const res = await pool().query<TenantRow>(
    `INSERT INTO tenants (name, api_key) VALUES ($1, $2) RETURNING *`,
    [name, apiKey]
  );
  return res.rows[0];
}


/* ------------------------------- documents ------------------------------- */

export async function insertDocument(
  tenantId: number,
  filename: string,
  pages: number,
  chunks: IngestChunk[],
  embedModel: string
): Promise<number> {
  return withTenant(tenantId, async (c) => {
    const doc = await c.query<{ id: number }>(
      `INSERT INTO documents (tenant_id, filename, pages, chunks, embed_model)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [tenantId, filename, pages, chunks.length, embedModel]
    );
    const docId = doc.rows[0].id;
    // Bulk insert chunks. pgvector accepts a string like '[0.1,0.2,...]'.
    for (const ch of chunks) {
      await c.query(
        `INSERT INTO chunks (tenant_id, document_id, page, idx, text, embedding)
         VALUES ($1, $2, $3, $4, $5, $6::vector)`,
        [
          tenantId,
          docId,
          ch.page,
          ch.idx,
          ch.text,
          `[${ch.vector.join(",")}]`,
        ]
      );
    }
    return docId;
  });
}

export async function listDocuments(tenantId: number) {
  return withTenant(tenantId, async (c) => {
    const res = await c.query(
      `SELECT id, filename, pages, chunks, created_at
       FROM documents WHERE tenant_id = $1 ORDER BY id DESC`,
      [tenantId]
    );
    return res.rows as Array<{
      id: number;
      filename: string;
      pages: number;
      chunks: number;
      created_at: string;
    }>;
  });
}

/**
 * Delete one document (and its chunks, via ON DELETE CASCADE) scoped to the
 * tenant. Returns the deleted filename, or null when the id is not theirs.
 * RLS already scopes the rows; the explicit tenant_id keeps intent obvious.
 */
export async function deleteDocument(
  tenantId: number,
  documentId: number
): Promise<string | null> {
  return withTenant(tenantId, async (c) => {
    const res = await c.query<{ filename: string }>(
      `DELETE FROM documents WHERE id = $1 AND tenant_id = $2 RETURNING filename`,
      [documentId, tenantId]
    );
    return res.rows[0]?.filename ?? null;
  });
}

/* -------------------------------- retrieve ------------------------------- */

export interface RetrievedChunk {
  id: number;
  documentId: number;
  filename: string;
  page: number;
  text: string;
  score: number;
}

/**
 * Exact-enough retrieval via pgvector cosine distance, de-duplicated across
 * re-ingested identical files, scoped to a tenant (and optionally one doc).
 */
export async function retrieve(
  tenantId: number,
  queryVector: number[],
  opts: { documentId?: number; k?: number; minScore?: number } = {}
): Promise<RetrievedChunk[]> {
  const k = opts.k ?? 6;
  const minScore = opts.minScore ?? 0.12;
  const vec = `[${queryVector.join(",")}]`;

  return withTenant(tenantId, async (c) => {
    const params: unknown[] = [vec, tenantId];
    let docFilter = "";
    if (opts.documentId) {
      params.push(opts.documentId);
      docFilter = ` AND c.document_id = $${params.length}`;
    }
    // Pull a wider pool so dedup still fills k.
    params.push(k * 6);
    const limitIdx = params.length;

    const res = await c.query(
      `SELECT c.id, c.document_id AS "documentId", c.page, c.text,
              d.filename,
              1 - (c.embedding <=> $1::vector) AS score
       FROM chunks c
       JOIN documents d ON d.id = c.document_id
       WHERE c.tenant_id = $2${docFilter}
       ORDER BY c.embedding <=> $1::vector
       LIMIT $${limitIdx}`,
      params
    );

    const seen = new Set<string>();
    const out: RetrievedChunk[] = [];
    for (const r of res.rows as Array<RetrievedChunk>) {
      const score = Number(r.score);
      if (score < minScore) continue;
      const key = `${r.filename}\u0000${r.page}\u0000${r.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...r, score });
      if (out.length >= k) break;
    }
    return out;
  });
}

/** Fallback exact cosine scan (used if pgvector operator is unavailable). */
export async function retrieveInMemory(
  tenantId: number,
  queryVector: number[],
  opts: { documentId?: number; k?: number; minScore?: number } = {}
): Promise<RetrievedChunk[]> {
  const k = opts.k ?? 6;
  const minScore = opts.minScore ?? 0.12;
  return withTenant(tenantId, async (c) => {
    const params: unknown[] = [tenantId];
    let docFilter = "";
    if (opts.documentId) {
      params.push(opts.documentId);
      docFilter = ` AND c.document_id = $${params.length}`;
    }
    const res = await c.query(
      `SELECT c.id, c.document_id AS "documentId", c.page, c.text,
              d.filename, c.embedding::text AS embedding
       FROM chunks c JOIN documents d ON d.id = c.document_id
       WHERE c.tenant_id = $1${docFilter}`,
      params
    );
    const rows = res.rows as Array<RetrievedChunk & { embedding: string }>;
    const parsed: RetrievedChunk[] = rows.map((r) => ({
      id: r.id,
      documentId: r.documentId,
      filename: r.filename,
      page: r.page,
      text: r.text,
      score: cosine(queryVector, parsePgVector(r.embedding)),
    }));
    parsed.sort((a, b) => b.score - a.score);
    return parsed.filter((x) => x.score >= minScore).slice(0, k);
  });
}

export async function stats(tenantId: number) {
  return withTenant(tenantId, async (c) => {
    const docs = await c.query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM documents WHERE tenant_id = $1`,
      [tenantId]
    );
    const ch = await c.query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM chunks WHERE tenant_id = $1`,
      [tenantId]
    );
    return { documents: Number(docs.rows[0].n), chunks: Number(ch.rows[0].n) };
  });
}

/** Parse a pgvector literal like "[0.1,-0.2,0.3]" into number[]. */
function parsePgVector(s: string): number[] {
  return s
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((x) => Number(x));
}

/* --------------------------- demo daily budget --------------------------- */

/**
 * Count one demo question against today's UTC budget and report whether it is
 * still allowed, enforcing BOTH a per-IP daily cap and a global daily cap.
 *
 * Why two caps: the global cap bounds total LLM spend, but on its own it is
 * drainable by a single caller — one IP could burn the whole day's budget and
 * lock every later visitor out. The per-IP cap (tiny) blunts that; the global
 * cap stays the real backstop. Both live in Postgres, not the in-memory
 * limiter, because that Map resets on every cold start / instance and so
 * cannot bound spend across instances.
 *
 * FAILS CLOSED: if the tables are missing or the query errors we return
 * `allowed: false`. On an anonymous LLM endpoint the safe default is to refuse
 * to spend, not to spend unbounded.
 */
export async function countDemoQuestion(
  ipKey: string,
  globalLimit: number,
  perIpLimit: number
): Promise<{ allowed: boolean; reason?: "ip" | "global" | "error" }> {
  try {
    const p = pool();

    const ip = await p.query<{ count: number }>(
      `INSERT INTO demo_usage_ip (day, ip, count)
       VALUES ((now() AT TIME ZONE 'utc')::date, $1, 1)
       ON CONFLICT (day, ip) DO UPDATE SET count = demo_usage_ip.count + 1
       RETURNING count`,
      [ipKey]
    );
    if ((ip.rows[0]?.count ?? 1) > perIpLimit) {
      return { allowed: false, reason: "ip" };
    }

    const global = await p.query<{ count: number }>(
      `INSERT INTO demo_usage (day, count)
       VALUES ((now() AT TIME ZONE 'utc')::date, 1)
       ON CONFLICT (day) DO UPDATE SET count = demo_usage.count + 1
       RETURNING count`
    );
    if ((global.rows[0]?.count ?? 1) > globalLimit) {
      return { allowed: false, reason: "global" };
    }

    return { allowed: true };
  } catch (err) {
    console.error("[demo] usage counter failed; denying request:", err);
    return { allowed: false, reason: "error" };
  }
}

/**
 * Whether the durable demo counters are usable. The demo endpoint fails closed
 * without them, so the landing probes this first and hides the whole demo
 * section on an un-migrated deploy rather than offering a card that 503s.
 */
export async function demoUsageReady(): Promise<boolean> {
  try {
    await pool().query(`SELECT 1 FROM demo_usage LIMIT 1`);
    await pool().query(`SELECT 1 FROM demo_usage_ip LIMIT 1`);
    return true;
  } catch {
    return false;
  }
}
