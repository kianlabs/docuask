/**
 * Next.js instrumentation hook — runs once per server start, before traffic.
 * Used to fail fast on a misconfigured production deploy (see lib/env.ts).
 */
import { assertEnv } from "./lib/env";

export function register() {
  assertEnv();
}
