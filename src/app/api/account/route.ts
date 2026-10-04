import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getAccountDashboard } from "@/lib/accounts";
import { serverError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/account — session-authenticated dashboard payload. */
export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ ok: false, error: "not signed in" }, { status: 401 });
    }
    const dashboard = await getAccountDashboard(session.tenantId);
    if (!dashboard) {
      return NextResponse.json({ ok: false, error: "account not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, account: dashboard });
  } catch (err) {
    return serverError("account.GET", err);
  }
}
