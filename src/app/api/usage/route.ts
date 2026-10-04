import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { getUsage, getPlans, upgradePlan } from "@/lib/billing";
import { serverError, badRequest } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/usage — this tenant's plan, usage, and remaining quota. */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth.tenant) {
      return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
    }
    const [usage, plans] = await Promise.all([getUsage(auth.tenant.id), getPlans()]);
    return NextResponse.json({ ok: true, tenantId: auth.tenant.id, usage, plans });
  } catch (err) {
    return serverError("usage.GET", err);
  }
}

/**
 * POST /api/usage { planCode } — MOCK self-service upgrade.
 *
 * WARNING: In production, disable this endpoint or guard it with a webhook token,
 * so tenants cannot grant themselves unlimited plans for free. The mock exists
 * for demo purposes only.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth.tenant) {
      return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
    }

    // Block self-upgrade in production unless explicitly enabled. This is a demo feature.
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_MOCK_UPGRADE !== "1"
    ) {
      return NextResponse.json(
        { error: "self-service upgrade is disabled; use the payment gateway" },
        { status: 403 }
      );
    }

    const body = (await req.json()) as { planCode?: string };
    if (!body.planCode) {
      return badRequest("planCode required");
    }

    // Whitelist valid plans to avoid leaking unknown-plan errors.
    const validPlans = ["free", "pro", "bisnis"];
    if (!validPlans.includes(body.planCode)) {
      return badRequest(`invalid planCode; must be one of ${validPlans.join(", ")}`);
    }

    const usage = await upgradePlan(auth.tenant.id, body.planCode);
    return NextResponse.json({ ok: true, mock: true, usage });
  } catch (err) {
    return serverError("usage.POST", err);
  }
}
