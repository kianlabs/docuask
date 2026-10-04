import { NextRequest, NextResponse } from "next/server";
import { adminOverview, upgradePlan } from "@/lib/billing";
import { isAdmin } from "@/lib/admin";
import { serverError, badRequest } from "@/lib/http";

export const runtime = "nodejs";

/** GET /api/admin — all tenants with plan + usage. Requires x-admin-token. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, tenants: await adminOverview() });
}

/** POST /api/admin { tenantId, planCode } — manual plan change by the operator. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { tenantId?: number; planCode?: string };
    if (!body.tenantId || !body.planCode) {
      return badRequest("tenantId and planCode required");
    }
    if (!Number.isInteger(body.tenantId) || body.tenantId <= 0) {
      return badRequest("tenantId must be a positive integer");
    }
    const validPlans = ["free", "pro", "bisnis"];
    if (!validPlans.includes(body.planCode)) {
      return badRequest(`invalid planCode; must be one of ${validPlans.join(", ")}`);
    }
    const usage = await upgradePlan(body.tenantId, body.planCode);
    return NextResponse.json({ ok: true, usage });
  } catch (err) {
    return serverError("admin.POST", err);
  }
}
