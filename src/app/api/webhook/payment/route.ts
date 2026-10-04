import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { upgradePlan } from "@/lib/billing";
import { serverError, badRequest } from "@/lib/http";

export const runtime = "nodejs";

const VALID_PLANS = ["free", "pro", "bisnis"];
const SETTLED_STATUSES = ["paid", "settlement", "capture", "success"];

/**
 * Constant-time HMAC-SHA256 check of the raw request body. The gateway signs
 * the exact bytes it sent, so we must verify BEFORE parsing JSON.
 */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * POST /api/webhook/payment — payment-gateway callback.
 *
 * This is the ONLY path allowed to change a tenant's plan in production; the
 * mock in /api/usage is disabled there. Wire Midtrans/Xendit to POST here with
 * `x-payment-signature: <hex hmac-sha256 of the raw body>` and a JSON body:
 *   { "tenantId": 12, "planCode": "pro", "status": "settlement", "eventId": "..." }
 * Adapt the mapping to your gateway; `status` must be a settled state to apply.
 *
 * Fail-closed: with no PAYMENT_WEBHOOK_SECRET configured, every call is 503.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "payment webhook not configured" },
        { status: 503 }
      );
    }

    const raw = await req.text();
    if (!verifySignature(raw, req.headers.get("x-payment-signature"), secret)) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    let payload: {
      tenantId?: number;
      planCode?: string;
      status?: string;
      eventId?: string;
    };
    try {
      payload = JSON.parse(raw);
    } catch {
      return badRequest("invalid JSON body");
    }

    const tenantId = payload.tenantId;
    if (typeof tenantId !== "number" || !Number.isInteger(tenantId) || tenantId <= 0) {
      return badRequest("tenantId must be a positive integer");
    }
    if (!payload.planCode || !VALID_PLANS.includes(payload.planCode)) {
      return badRequest(`planCode must be one of ${VALID_PLANS.join(", ")}`);
    }

    // Gateways emit many statuses (pending, expire, deny, refund, ...). Only a
    // settled payment changes the plan; everything else is acknowledged and
    // ignored so the gateway stops retrying.
    if (payload.status && !SETTLED_STATUSES.includes(payload.status)) {
      return NextResponse.json({ ok: true, ignored: true, status: payload.status });
    }

    const usage = await upgradePlan(tenantId, payload.planCode);
    return NextResponse.json({ ok: true, tenantId, usage });
  } catch (err) {
    return serverError("webhook.payment.POST", err);
  }
}
