/**
 * Environment validation — fail fast, and never at request time.
 *
 * Two levels:
 *   - REQUIRED: without these the app cannot serve a single useful request
 *     (no database, no way to sign anyone in). Missing in production = refuse
 *     to boot rather than 500 on the first customer.
 *   - RECOMMENDED: features degrade gracefully (admin panel, payment webhook,
 *     semantic embeddings). Missing = warn once, feature stays fail-closed.
 *
 * Importing this module never throws. `assertEnv()` is called from
 * instrumentation.ts (boot) and by the health check, so an import-time side
 * effect can never crash a route that would otherwise have worked.
 *
 * Server-only: DATABASE_URL and the secrets must never reach the browser.
 */

const isProd = process.env.NODE_ENV === "production";

interface Spec {
  name: string;
  /** Why it matters, shown in the error/warning line. */
  reason: string;
}

const REQUIRED: Spec[] = [
  { name: "DATABASE_URL", reason: "Postgres + pgvector connection; nothing works without it" },
];

/** Required only once a feature is switched on (checked separately). */
const RECOMMENDED: Spec[] = [
  { name: "SESSION_SECRET", reason: "signs login cookies — unset disables signup/login" },
  { name: "ADMIN_TOKEN", reason: "protects /admin and /api/admin — unset disables them" },
  { name: "PAYMENT_WEBHOOK_SECRET", reason: "verifies payment callbacks — unset disables upgrades" },
  { name: "CLOUDFLARE_ACCOUNT_ID", reason: "Cloudflare embeddings — falls back to lexical hash" },
  { name: "CLOUDFLARE_API_TOKEN", reason: "Cloudflare embeddings — falls back to lexical hash" },
  { name: "LLM_BASE_URL", reason: "OpenAI-compatible gateway for answers" },
  { name: "LLM_MODEL", reason: "model id sent to the gateway" },
];

function present(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

export interface EnvReport {
  ok: boolean;
  missingRequired: string[];
  missingRecommended: string[];
  problems: string[];
}

/** Inspect the environment without throwing. Used by boot and /api/health. */
export function inspectEnv(): EnvReport {
  const missingRequired = REQUIRED.filter((s) => !present(s.name)).map((s) => s.name);
  const missingRecommended = RECOMMENDED.filter((s) => !present(s.name)).map((s) => s.name);

  const problems: string[] = [];
  for (const name of missingRequired) {
    const spec = REQUIRED.find((s) => s.name === name)!;
    problems.push(`${name} is required: ${spec.reason}`);
  }

  // A production deploy on http:// leaks the API key and prompt in cleartext.
  if (isProd && present("LLM_BASE_URL") && process.env.LLM_BASE_URL!.startsWith("http://")) {
    problems.push("LLM_BASE_URL uses http:// in production — the API key travels in cleartext");
  }

  return {
    ok: missingRequired.length === 0,
    missingRequired,
    missingRecommended,
    problems,
  };
}

/**
 * Boot-time check. In production a missing REQUIRED var is fatal — the process
 * exits before serving traffic, so a container orchestrator restarts it instead
 * of leaving a running-but-broken instance behind. In development we only warn
 * so `next dev` still starts while you fill in .env.local.
 */
export function assertEnv(): void {
  const report = inspectEnv();

  for (const name of report.missingRecommended) {
    const spec = RECOMMENDED.find((s) => s.name === name)!;
    console.warn(`[env] ${name} not set — ${spec.reason}`);
  }
  for (const p of report.problems) {
    console.error(`[env] ${p}`);
  }

  if (!report.ok && isProd) {
    console.error(
      `[env] Refusing to start: missing required env — ${report.missingRequired.join(", ")}`
    );
    // Hard exit (not throw): a thrown instrumentation error can leave the
    // server process alive but unable to serve, which orchestrators treat as
    // "running". Exiting lets `restart: unless-stopped` retry cleanly.
    process.exit(1);
  }
}
