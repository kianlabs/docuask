/**
 * Auth — resolve the calling tenant from an API key OR a login session.
 *
 * Key is read from the `x-api-key` header, or `Authorization: Bearer <key>`.
 * If no key is present, the signed session cookie (see lib/session.ts) is used
 * so the browser UI can call tenant endpoints without pasting a key.
 */

import { NextRequest } from "next/server";
import { getOrCreateTenantByApiKey, createTenant, TenantRow } from "./store";
import { getSessionFromRequest } from "./session";
import { getTenantById } from "./accounts";

export function extractApiKey(req: NextRequest): string | null {
  const header = req.headers.get("x-api-key");
  if (header) return header.trim();
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

export interface AuthResult {
  tenant: TenantRow | null;
  error?: string;
  status?: number;
}

/**
 * Resolve the tenant for this request, in order of precedence:
 * 1. An explicit API key (x-api-key / Bearer) — used by API clients and tests.
 * 2. The signed session cookie — used by the browser UI.
 * A key present but invalid is a hard 401 (it does not silently fall through
 * to the session), so a bad key never borrows a logged-in browser's tenant.
 */
export async function authenticate(req: NextRequest): Promise<AuthResult> {
  const key = extractApiKey(req);
  if (key) {
    const tenant = await getOrCreateTenantByApiKey(key);
    if (tenant) return { tenant };

    // Auto-provision only keys explicitly listed in the dev allowlist.
    const allow = (process.env.DOCUASK_DEV_TENANT_KEYS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (allow.includes(key)) {
      const created = await createTenant(`auto:${key.slice(0, 6)}`, key);
      return { tenant: created };
    }
    return { tenant: null, error: "invalid API key", status: 401 };
  }

  // No API key: fall back to the login session cookie.
  const session = getSessionFromRequest(req);
  if (session) {
    const tenant = await getTenantById(session.tenantId);
    if (tenant) return { tenant };
  }

  return { tenant: null, error: "missing API key", status: 401 };
}
