/**
 * HTTP helpers — keep internal error detail out of client responses.
 *
 * Route handlers must never echo `err.message` straight back: driver/DB errors
 * leak schema names, constraint text, and connection details. Log the full
 * error server-side, return a stable opaque code to the caller.
 */

import { NextResponse } from "next/server";

export function serverError(scope: string, err: unknown, status = 500) {
  console.error(`[api:${scope}]`, err);
  return NextResponse.json({ ok: false, error: "internal_error" }, { status });
}

/** A controlled 4xx the caller is allowed to see (validation, not internals). */
export function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}
