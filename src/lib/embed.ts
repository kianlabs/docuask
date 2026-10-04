/**
 * Embedding layer — pluggable. Two providers, one interface.
 *
 * Provider "cloudflare": Cloudflare Workers AI `@cf/baai/bge-m3` (1024-dim).
 *   Real semantic embeddings. Needs CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN.
 * Provider "hash": deterministic feature-hashing (256-dim), zero credentials.
 *   Lexical only (weaker paraphrase recall) — used as fallback / offline dev.
 *
 * Selection: EMBED_PROVIDER env, else auto (cloudflare if creds present, else hash).
 *
 * IMPORTANT: query and chunks MUST be embedded in the SAME space. The store
 * records the model per chunk; a mismatch makes retrieval silently wrong. The
 * `/api/chat` diagnostic surfaces the active provider so drift is visible.
 */

export const HASH_DIM = 1024; // Must match sql/schema.sql vector(1024) column
export const HASH_MODEL = "hash-1024";
export const CF_MODEL = "@cf/baai/bge-m3";
export const CF_DIM = 1024;

export type EmbedProvider = "cloudflare" | "hash";

export interface EmbedResult {
  vectors: number[][];
  provider: EmbedProvider;
  model: string;
  dims: number;
}

/* ----------------------------- hash provider ----------------------------- */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f]+/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

function fnv1a(str: string, seed = 0x811c9dc5): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function embedHashOne(text: string): number[] {
  const vec = new Float64Array(HASH_DIM);
  const tokens = tokenize(text);
  if (tokens.length === 0) return Array.from(vec);
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  for (const [tok, count] of tf) {
    const idx = fnv1a(tok) % HASH_DIM;
    const sign = fnv1a(tok, 0x9e3779b1) % 2 === 0 ? 1 : -1;
    vec[idx] += sign * Math.sqrt(count);
  }
  let norm = 0;
  for (let i = 0; i < HASH_DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  const out = new Array<number>(HASH_DIM);
  for (let i = 0; i < HASH_DIM; i++) out[i] = vec[i] / norm;
  return out;
}

/* -------------------------- cloudflare provider -------------------------- */

function cfConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
  const apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
  return { accountId, apiToken, ready: accountId.length > 0 && apiToken.length > 0 };
}

async function embedCloudflare(texts: string[]): Promise<number[][]> {
  const { accountId, apiToken } = cfConfig();
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: texts }),
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Cloudflare embed ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    success: boolean;
    result?: { data?: number[][] };
    errors?: unknown;
  };
  const data = json.result?.data;
  if (!json.success || !Array.isArray(data)) {
    throw new Error(`Cloudflare embed failed: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return data;
}

/* ------------------------------- public API ------------------------------ */

export function activeProvider(): EmbedProvider {
  const forced = process.env.EMBED_PROVIDER as EmbedProvider | undefined;
  if (forced === "cloudflare" || forced === "hash") return forced;
  return cfConfig().ready ? "cloudflare" : "hash";
}

export async function embed(texts: string[]): Promise<EmbedResult> {
  const provider = activeProvider();
  if (provider === "cloudflare") {
    try {
      const vectors = await embedCloudflare(texts);
      return { vectors, provider, model: CF_MODEL, dims: CF_DIM };
    } catch (err) {
      // Fall back to hash so the app degrades instead of failing outright.
      // The caller records provider/model per chunk, so a mixed store is
      // detectable via the chat diagnostics.
      if (process.env.EMBED_STRICT === "1") throw err;
      console.error("[embed] cloudflare failed, falling back to hash:", err);
    }
  }
  return {
    vectors: texts.map(embedHashOne),
    provider: "hash",
    model: HASH_MODEL,
    dims: HASH_DIM,
  };
}

export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
