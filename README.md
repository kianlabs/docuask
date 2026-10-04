# DocuAsk

Upload a PDF, ask questions, get **answers with page citations**. Multi-tenant
retrieval-augmented generation (RAG).

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **Postgres + pgvector** — vector search with an HNSW index (cosine)
- **Cloudflare Workers AI `@cf/baai/bge-m3`** — 1024-dim semantic embeddings
  (falls back to a local 1024-dim hash embedder with no credentials)
- **Any OpenAI-compatible LLM** — point `LLM_BASE_URL` at your gateway
- **Multi-tenant + Row-Level Security** — isolation enforced in the database

## Quick start

```bash
# 1. Database (pgvector). Replace the password before any real use.
docker run -d --name docuask-pg \
  -e POSTGRES_USER=docuask -e POSTGRES_PASSWORD=change_me_dev_pw \
  -e POSTGRES_DB=docuask -p 127.0.0.1:5433:5432 \
  pgvector/pgvector:pg18

# 2. Schema + a NON-superuser app role (RLS requires it — see PITFALLS).
#    Set the app-role password once; it must match the one in DATABASE_URL.
#    (Use a real secret in production; the fallback in roles.sql is dev-only.)
export DOCUASK_APP_PASSWORD=change_me_app_pw
docker exec -i docuask-pg psql -U docuask -d docuask -f - < sql/schema.sql
docker exec -i docuask-pg psql -U docuask -d docuask -f - < sql/billing.sql
docker exec -i docuask-pg psql -U docuask -d docuask -f - < sql/accounts.sql
docker exec -i docuask-pg psql -U docuask -d docuask \
  -v app_password="$DOCUASK_APP_PASSWORD" -f - < sql/roles.sql

# 3. Config
cp .env.example .env.local   # fill DATABASE_URL, CF creds, LLM key

# 4. Run
npm install
npx next dev -p 3005
```

The app-role password (`DOCUASK_APP_PASSWORD`) must match the one embedded in
`DATABASE_URL`. Use a real secret in production.

Nodes 22 LTS is required if you use `better-sqlite3`; with Postgres any recent
LTS works. Pin with `.node-version`.

## Sample document

`samples/kebijakan-cuti-contoh.pdf` is a 3-page sample with a real text layer
(HR leave/benefit policy) for trying ingest + Q&A. Regenerate or make your own
with the dependency-free generator:

```bash
python3 samples/make_sample_pdf.py [output.pdf]
```

Then ingest and query it (grab an API key from `/account` or a dev key):

```bash
curl -H "x-api-key: $API_KEY" -F "file=@samples/kebijakan-cuti-contoh.pdf" \
  http://localhost:3005/api/ingest
curl -H "x-api-key: $API_KEY" -H 'Content-Type: application/json' \
  -d '{"question":"Berapa hari cuti tahunan?"}' http://localhost:3005/api/chat
```

## Multi-tenancy

- Every request carries an API key (`x-api-key` or `Authorization: Bearer`).
- The key resolves to a tenant (`tenants` table). Keys listed in
  `DOCUASK_DEV_TENANT_KEYS` are auto-provisioned on first use.
- Every query filters `tenant_id`, **and** Postgres RLS rejects cross-tenant
  rows even if a query forgets. See `sql/schema.sql` and `src/lib/store.ts`
  (`withTenant()` sets `app.tenant_id` per transaction).
- Verified: tenant B asking a question answerable only from tenant A's document
  gets "not in the document", never A's content.

## Anti-hallucination

1. **Retrieval floor** — if no chunk scores above the floor, the LLM is not
   called at all (`usedLlm: false`, `reason: below_retrieval_floor`).
2. **Grounded prompt** — the model may only use retrieved context and must cite
   `[page N]`; otherwise it must reply that the answer is not in the document.

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/ingest` | multipart `file` (PDF) → extract, chunk, embed, store |
| `GET`  | `/api/ingest` | list this tenant's documents |
| `POST` | `/api/chat`   | `{question, documentId?, k?}` → answer + citations |
| `GET`  | `/api/chat`   | diagnostics (authenticated tenants only; embed provider, LLM, store counts) |
| `GET`  | `/api/usage`  | this tenant's plan, usage, remaining quota |
| `POST` | `/api/usage`  | mock self-upgrade — **disabled in production** unless `ALLOW_MOCK_UPGRADE=1` |
| `POST` | `/api/auth/signup` | `{email, password}` → creates tenant + owner, sets session cookie, returns API key |
| `POST` | `/api/auth/login`  | `{email, password}` → sets session cookie |
| `POST` | `/api/auth/logout` | clears the session cookie |
| `GET`  | `/api/account` | session-authenticated dashboard payload (email, API key, plan, usage, orders) |
| `POST` | `/api/account/rotate-key` | rotate this tenant's API key (session-authenticated) |
| `POST` | `/api/orders` | `{planCode}` → create a `pending` order for the signed-in tenant |
| `GET`  | `/api/orders` | the signed-in tenant's own orders |
| `DELETE` | `/api/orders?ref=...` | cancel one's own `pending` order |
| `GET`  | `/api/admin`  | all tenants + usage (requires `x-admin-token`) |
| `POST` | `/api/admin`  | operator plan change (requires `x-admin-token`) |
| `GET`  | `/api/admin/orders` | all orders (requires `x-admin-token`) |
| `POST` | `/api/admin/orders` | `{orderRef}` → mark paid + upgrade the tenant (requires `x-admin-token`) |
| `POST` | `/api/webhook/payment` | payment-gateway callback (HMAC-SHA256 `x-payment-signature`; fail-closed) |

All tenant endpoints require an API key. `/api/chat` GET only exposes the LLM
endpoint/model to authenticated tenants (or with `EXPOSE_PUBLIC_DIAGNOSTICS=1`).

## Billing

- Plans (`free`/`pro`/`bisnis`) cap **documents** and **questions** per month.
- The **documents** quota is derived from `COUNT(*)` on the `documents` table —
  the source of truth — so it can never drift from what is actually stored.
  **Questions** use a monthly counter in `usage_counters`.
- In production the mock self-upgrade is blocked; plan changes come from the
  signed payment webhook (`PAYMENT_WEBHOOK_SECRET`). Unset secret = 503.

## Accounts & orders

Self-service onboarding and a gateway-agnostic purchase flow:

- **Sign up** (`/signup`) creates a tenant + owner user in one transaction and
  hands back an API key (also shown on `/account`). Passwords are hashed with
  `scrypt` (`src/lib/password.ts`); sessions are a stateless HMAC cookie
  (`src/lib/session.ts`, `SESSION_SECRET`, 30-day TTL).
- **Buying a plan** (`/account`) creates a `pending` order. The plan does **not**
  change until a trusted party confirms payment:
  - **Manual today:** an operator marks the order paid in `/admin` (or via
    `POST /api/admin/orders`), which calls `upgradePlan()`.
  - **Gateway later:** point Midtrans/Xendit at `POST /api/webhook/payment`
    with `{"orderRef": "ord_...", "status": "settlement"}`. The tenant + plan
    are read from the stored order, so the gateway cannot choose them.
- `users` and `orders` are RLS-protected with the same tenant policy as the rest
  of the schema (see `sql/accounts.sql`); login-by-email and the admin order list
  run under the transaction-local `app.is_admin` flag.

## Security

- **Secrets stay in env.** `.env.local` is git-ignored; `.env.example` holds
  placeholders only. Never commit real credentials.
- **Admin auth is fail-closed.** With `ADMIN_TOKEN` unset, `/admin` and
  `/api/admin` are disabled. The token is compared in constant time.
- **Payment webhook is fail-closed.** With `PAYMENT_WEBHOOK_SECRET` unset,
  `/api/webhook/payment` returns 503. Requests must carry a valid
  HMAC-SHA256 signature.
- **Customer sessions are fail-closed.** With `SESSION_SECRET` (or `ADMIN_TOKEN`)
  unset, signup/login are disabled. Session cookies are `httpOnly`, `sameSite=lax`,
  and `secure` in production; tokens are HMAC-signed so ids cannot be tampered with.
- **Tenant isolation is in the database** (RLS), not only in application code.
- The mock self-upgrade in `POST /api/usage` is disabled in production unless
  `ALLOW_MOCK_UPGRADE=1`.

## License

MIT — see [LICENSE](./LICENSE).

## PITFALLS (verified the hard way — do not repeat)

1. **RLS is bypassed by superusers.** If the app connects as a superuser (or a
   role with `BYPASSRLS`), `ENABLE`+`FORCE ROW LEVEL SECURITY` does **nothing**
   and cross-tenant rows leak. Always connect the app as an ordinary role
   (`sql/roles.sql`). Verify with:
   `SELECT rolname, rolsuper, rolbypassrls FROM pg_roles;`
2. **`FORCE ROW LEVEL SECURITY` is still required.** Without it, the table
   *owner* bypasses policies.
3. **Unset `app.tenant_id` must fail closed.** `current_setting(..., true)`
   returns NULL, and `tenant_id = NULL` is never true → zero rows. Keep the
   `true` (missing_ok) argument.
4. **Never `next build` while `next dev` is running** — they share `.next/` and
   the dev server corrupts (`MODULE_NOT_FOUND`, empty API bodies). Kill dev,
   `rm -rf .next`, restart.
5. **`next lint` prompts interactively** without a config — add `.eslintrc.json`
   and run `CI=1 npm run lint`.
6. **Hash embeddings are lexical.** Paraphrased questions can rank the wrong
   page. That is why bge-m3 is the default; the hash provider is a fallback.
7. **`EADDRINUSE` after killing dev** — Next leaves a child `next-server`. Kill
   by matching cwd, not just the parent PID.
