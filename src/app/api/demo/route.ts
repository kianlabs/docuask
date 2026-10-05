/**
 * Public demo endpoint — answer a question against the demo tenant, no signup.
 *
 * Cost control (this endpoint calls the LLM on an anonymous request, so every
 * guard matters):
 *   1. Fail-closed gate: disabled unless DEMO_TENANT_ID is set. An unconfigured
 *      deploy returns 503 and never touches the LLM.
 *   2. Per-IP fixed-window limit (in-memory) — stops a single caller hammering.
 *   3. Durable daily cap in Postgres (countDemoQuestion) — the real spend
 *      ceiling, because the in-memory limiter resets per instance.
 *   4. Short question cap (300 chars) — it is a demo, not a full workbench.
 *
 * Privacy: the question text is NOT stored and NOT logged. Only a counter
 * moves. Retrieval is read-only (answerQuestion never writes).
 */

import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/rag";
import { countDemoQuestion } from "@/lib/store";
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

export async function POST(req: NextRequest) {
  const tenantId = Number(process.env.DEMO_TENANT_ID);
  if (!Number.isInteger(tenantId) || tenantId <= 0) {
    // Fail closed: the demo is opt-in per environment.
    return NextResponse.json(
      { ok: false, error: "demo_disabled" },
      { status: 503 }
    );
  }

  try {
    // Per-IP rate limit: 5 questions per minute.
    const rl = rateLimit(`demo:${clientIp(req)}`, 5, 60_000);
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

    // Durable daily ceiling. Checked AFTER validation so empty/invalid probes
    // do not consume budget.
    const dailyLimit = Number(process.env.DEMO_DAILY_LIMIT) || 200;
    const daily = await countDemoQuestion(dailyLimit);
    if (!daily.allowed) {
      return NextResponse.json(
        { ok: false, error: "demo_daily_limit" },
        { status: 429 }
      );
    }

    const result = await answerQuestion(tenantId, question, { k: 4 });

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
