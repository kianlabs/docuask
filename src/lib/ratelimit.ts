/**
 * Minimal fixed-window rate limiter.
 *
 * NOTE: in-memory and therefore per-process. Fine for a single instance; behind
 * multiple instances / serverless this must move to a shared store (Redis,
 * Postgres, or the edge platform's limiter). It exists to stop a single tenant
 * (or a leaked key) from unbounded LLM spend — not as a DDoS shield.
 */

interface Bucket {
  count: number;
  reset: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

export function rateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();

  // Opportunistic prune so the map cannot grow without bound.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (now >= b.reset) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || now >= b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((b.reset - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, remaining: limit - b.count, retryAfter: 0 };
}
