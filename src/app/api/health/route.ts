import { NextResponse } from "next/server";
import { pool } from "@/lib/store";
import { inspectEnv } from "@/lib/env";
import { isAdmin } from "@/lib/admin";

/**
 * Liveness + readiness probe for load balancers, uptime monitors, and deploys.
 *
 * Returns 200 only when the database answers. A 503 tells the platform not to
 * route traffic to this instance. Unauthenticated by design (probes cannot
 * carry secrets), so the body stays minimal: booleans and counts, never values,
 * connection strings, or error messages. Detailed env gaps require the admin
 * token, keeping internal config names off a public endpoint.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const started = Date.now();
  let database = false;
  let databaseError: string | undefined;

  try {
    const res = await pool().query("SELECT 1 AS ok");
    database = res.rows[0]?.ok === 1;
  } catch (err) {
    // Log the real cause server-side; expose only a generic flag publicly.
    console.error("[api:health] database check failed", err);
    databaseError = "unreachable";
  }

  const env = inspectEnv();
  const ok = database && env.ok;

  const body: Record<string, unknown> = {
    ok,
    status: ok ? "healthy" : "unhealthy",
    checks: {
      database: database ? "up" : "down",
      env: env.ok ? "ok" : "missing_required",
    },
    latencyMs: Date.now() - started,
    time: new Date().toISOString(),
  };

  if (!database && databaseError) {
    (body.checks as Record<string, unknown>).databaseError = databaseError;
  }

  // Config detail is operator-only: names are harmless, but no reason to
  // advertise which secrets exist to anonymous callers.
  if (isAdmin(req)) {
    body.config = {
      missingRequired: env.missingRequired,
      missingRecommended: env.missingRecommended,
      problems: env.problems,
    };
  }

  return NextResponse.json(body, { status: ok ? 200 : 503 });
}
