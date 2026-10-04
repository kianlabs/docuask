import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/rag";
import { llmConfig } from "@/lib/llm";
import { stats } from "@/lib/store";
import { activeProvider, CF_DIM, HASH_DIM } from "@/lib/embed";
import { authenticate } from "@/lib/auth";
import { assertQuota, recordUsage, QuotaExceededError } from "@/lib/billing";
import { serverError, badRequest } from "@/lib/http";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth.tenant) {
      return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
    }
    const tenantId = auth.tenant.id;

    // Rate limit: 60 requests per minute per tenant.
    const rl = rateLimit(`chat:${tenantId}`, 60, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    // Quota check BEFORE calling the LLM.
    try {
      await assertQuota(tenantId, "questions");
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        return NextResponse.json(
          { error: err.message, metric: err.metric, limit: err.limit, used: err.used },
          { status: 402 }
        );
      }
      throw err;
    }

    const body = (await req.json()) as {
      question?: string;
      documentId?: number;
      k?: number;
    };
    const question = (body.question ?? "").trim();
    if (!question) {
      return badRequest("question required");
    }
    const MAX_QUESTION_CHARS = 8000;
    if (question.length > MAX_QUESTION_CHARS) {
      return badRequest(`question too long (max ${MAX_QUESTION_CHARS} characters)`);
    }
    // Validate optional params
    if (body.documentId !== undefined && (!Number.isInteger(body.documentId) || body.documentId <= 0)) {
      return badRequest("documentId must be a positive integer");
    }
    if (body.k !== undefined && (!Number.isInteger(body.k) || body.k < 1 || body.k > 50)) {
      return badRequest("k must be an integer between 1 and 50");
    }

    const result = await answerQuestion(tenantId, question, {
      documentId: body.documentId,
      k: body.k,
    });

    // Count the question when the LLM actually ran (a retrieval-floor refusal
    // costs us nothing, so it is not billed).
    if (result.usedLlm) {
      await recordUsage(tenantId, "question", 1, {
        chars: question.length,
        usedLlm: result.usedLlm,
      });
    }

    return NextResponse.json({ ok: true, tenantId, ...result });
  } catch (err) {
    return serverError("chat.POST", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    // The LLM endpoint/model and embed provider can reveal internal
    // infrastructure, so they are only exposed to authenticated tenants — or
    // publicly when the operator explicitly opts in (e.g. a status page).
    const exposeConfig =
      !!auth.tenant || process.env.EXPOSE_PUBLIC_DIAGNOSTICS === "1";

    const payload: Record<string, unknown> = { ok: true };
    if (exposeConfig) {
      const provider = activeProvider();
      const cfg = llmConfig();
      payload.llm = { baseUrl: cfg.baseUrl, model: cfg.model, configured: cfg.configured };
      payload.embed = {
        provider,
        model: provider === "cloudflare" ? "@cf/baai/bge-m3" : "hash-1024",
        dims: provider === "cloudflare" ? CF_DIM : HASH_DIM,
      };
    }

    if (!auth.tenant) {
      return NextResponse.json({ ...payload, authenticated: false });
    }
    return NextResponse.json({
      ...payload,
      authenticated: true,
      tenantId: auth.tenant.id,
      tenantName: auth.tenant.name,
      store: await stats(auth.tenant.id),
    });
  } catch (err) {
    return serverError("chat.GET", err);
  }
}
