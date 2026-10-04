import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { listAllOrders, markOrderPaid } from "@/lib/accounts";
import { badRequest, serverError } from "@/lib/http";

export const runtime = "nodejs";

/** GET /api/admin/orders — every order (newest first). Requires x-admin-token. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, orders: await listAllOrders() });
  } catch (err) {
    return serverError("admin.orders.GET", err);
  }
}

/**
 * POST /api/admin/orders { orderRef } — the trusted "mark paid" path for the
 * manual flow: flips the order to paid and upgrades the tenant's plan.
 */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = (await req.json().catch(() => null)) as { orderRef?: string } | null;
    if (!body?.orderRef) return badRequest("orderRef required");
    const order = await markOrderPaid(body.orderRef);
    if (!order) return NextResponse.json({ ok: false, error: "order not found" }, { status: 404 });
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    return serverError("admin.orders.POST", err);
  }
}
