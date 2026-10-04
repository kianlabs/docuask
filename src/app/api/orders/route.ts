import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { createOrder, listOrders, cancelOrder } from "@/lib/accounts";
import { badRequest, serverError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/orders — the signed-in tenant's own orders. */
export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ ok: false, error: "not signed in" }, { status: 401 });
    return NextResponse.json({ ok: true, orders: await listOrders(session.tenantId) });
  } catch (err) {
    return serverError("orders.GET", err);
  }
}

/**
 * POST /api/orders { planCode } — create a pending order for the signed-in
 * tenant. Gateway-agnostic: this only records intent; the plan changes when a
 * trusted party confirms payment (admin or a real gateway webhook).
 */
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ ok: false, error: "not signed in" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as { planCode?: string } | null;
    if (!body?.planCode) return badRequest("planCode required");

    const order = await createOrder(session.tenantId, body.planCode);
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    if (err instanceof Error && /unknown plan|not purchasable/.test(err.message)) {
      return badRequest(err.message);
    }
    return serverError("orders.POST", err);
  }
}

/** DELETE /api/orders?ref=... — cancel one's own pending order. */
export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ ok: false, error: "not signed in" }, { status: 401 });
    const ref = req.nextUrl.searchParams.get("ref");
    if (!ref) return badRequest("ref required");
    const order = await cancelOrder(session.tenantId, ref);
    if (!order) return NextResponse.json({ ok: false, error: "order not found" }, { status: 404 });
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    return serverError("orders.DELETE", err);
  }
}
