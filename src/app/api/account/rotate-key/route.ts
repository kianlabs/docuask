import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { rotateApiKey } from "@/lib/accounts";
import { serverError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/account/rotate-key — invalidate the old API key and issue a new one.
 * Session-authenticated; returns the new key once so the caller can update.
 */
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ ok: false, error: "not signed in" }, { status: 401 });
    }
    const apiKey = await rotateApiKey(session.tenantId);
    return NextResponse.json({ ok: true, apiKey });
  } catch (err) {
    return serverError("account.rotateKey.POST", err);
  }
}
