/**
 * Public demo endpoint — answer a question against the demo tenant, no signup.
 *
 * Cost control (this endpoint calls the LLM on an anonymous request, so every
 * guard matters):
 *   1. Fail-closed gate: disabled unless DEMO_TENANT_ID is set AND the durable
 *      counters are present. An unconfigured deploy answers 503 (POST) or
 *      {enabled:false} (GET) and never touches the LLM.
 *   2. Per-IP fixed-window limit (in-memory) — stops a single caller hammering.
 *   3. Durable caps in Postgres (countDemoQuestion): a small per-IP daily cap
 *      AND a global daily cap. The global one is the real spend ceiling; the
 *      per-IP one stops a single caller from draining it. Both are needed
 *      because the in-memory limiter resets per instance.
 *   4. Short question cap (300 chars) — it is a demo, not a full workbench.
 *
 * Privacy: the question text is NOT stored and NOT logged. Only counters move,
 * and the per-IP counter keys on a salted hash — no raw IP is persisted.
 * Retrieval is read-only (answerQuestion never writes).
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { answerQuestion } from "@/lib/rag";
import { countDemoQuestion, demoUsageReady } from "@/lib/store";
import { rateLimit } from "@/lib/ratelimit";
import { serverError, badRequest } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_QUESTION_CHARS = 300;

/** Best-effort client IP: x-forwarded-for first (proxies/Vercel), then remote. */
function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Salted hash so the durable per-IP counter stores no raw address. */
function ipHash(ip: string): string {
  const salt = process.env.SESSION_SECRET || "docuask-demo";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

function demoConfig(): { tenantId: number; globalLimit: number; perIpLimit: number } | null {
  const tenantId = Number(process.env.DEMO_TENANT_ID);
  if (!Number.isInteger(tenantId) || tenantId <= 0) return null;
  return {
    tenantId,
    globalLimit: Number(process.env.DEMO_DAILY_LIMIT) || 200,
    perIpLimit: Number(process.env.DEMO_DAILY_LIMIT_PER_IP) || 10,
  };
}

/**
 * Whether the demo can actually serve a request. The landing probes this so it
 * can hide the demo section on an unconfigured / un-migrated deploy instead of
 * showing a card that would 503 on first submit.
 */
export async function GET() {
  if (!demoConfig()) {
    return NextResponse.json({ enabled: false });
  }
  const ready = await demoUsageReady();
  return NextResponse.json({ enabled: ready });
}

export async function POST(req: NextRequest) {
  const cfg = demoConfig();
  if (!cfg) {
    // Fail closed: the demo is opt-in per environment.
    return NextResponse.json(
      { ok: false, error: "demo_disabled" },
      { status: 503 }
    );
  }

  try {
    const ip = clientIp(req);

    // Per-IP rate limit: 5 questions per minute.
    const rl = rateLimit(`demo:${ip}`, 5, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = (await req.json().catch(() => ({}))) as { question?: string };
    const question = (body.question ?? "").trim();
    if (!question) return badRequest("question required");
    if (question.length > MAX_QUESTION_CHARS) {
      return badRequest(`question too long (max ${MAX_QUESTION_CHARS} characters)`);
    }

    // Durable caps. Checked AFTER validation so empty/invalid probes do not
    // consume budget. Fails closed: a counter error denies the request.
    const daily = await countDemoQuestion(ipHash(ip), cfg.globalLimit, cfg.perIpLimit);
    if (!daily.allowed) {
      return NextResponse.json(
        { ok: false, error: "demo_daily_limit", scope: daily.reason ?? "global" },
        { status: 429 }
      );
    }

    const result = await answerQuestion(cfg.tenantId, question, { k: 4 });

    // Shape the response for a public caller: no tenant ids, no scores, no
    // internal diagnostics. Only what the landing card renders.
    return NextResponse.json({
      ok: true,
      answer: result.answer,
      usedLlm: result.usedLlm,
      citations: result.citations.map((c) => ({
        filename: c.filename,
        page: c.page,
      })),
    });
  } catch (err) {
    return serverError("demo", err);
  }
}
