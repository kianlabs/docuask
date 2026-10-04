# Deployment

Two supported paths: **Docker (self-host)** and **Vercel + managed Postgres**.
Both need a Postgres database with the `pgvector` extension.

---

## 0. Before either path

Generate the two secrets (never reuse the examples):

```bash
openssl rand -hex 32   # SESSION_SECRET
openssl rand -hex 32   # ADMIN_TOKEN
```

Apply the schema once against your database, in order:

```bash
psql "$DATABASE_URL" -f sql/schema.sql     # tables + RLS + pgvector
psql "$DATABASE_URL" -f sql/billing.sql    # plans + usage
psql "$DATABASE_URL" -f sql/accounts.sql   # users + orders
# Create the NON-superuser app role (RLS is bypassed by superusers):
DOCUASK_APP_PASSWORD='<strong-password>' \
  psql "$ADMIN_URL" -v app_password="$DOCUASK_APP_PASSWORD" -f sql/roles.sql
```

The app **must** connect as `docuask_app` (an ordinary role). See
`README.md → PITFALLS` for why a superuser silently disables tenant isolation.

---

## 1. Docker (recommended for a VPS)

Ships the app plus a pgvector database and runs migrations automatically.

```bash
cp .env.example .env      # fill the values (see the header of docker-compose.yml)
docker compose up -d --build
docker compose logs -f app
curl -fsS http://localhost:3000/api/health   # expect {"ok":true,...}
```

The `migrate` service applies `sql/*.sql` (idempotent) and creates the app role
on every `up`, so the first boot is fully provisioned.

### Behind a reverse proxy (TLS)

Put Caddy/Nginx/Traefik in front for HTTPS — HSTS and `secure` session cookies
only work over TLS. Minimal Caddy example:

```
docuask.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

The app already sends `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`, and HSTS (see `next.config.js`).

### Operating notes

- **Scaling**: the rate limiter (`src/lib/ratelimit.ts`) is in-memory and
  per-process. With more than one app replica, move it to Redis/Postgres or
  accept that limits are per-instance.
- **Backups**: back up the `db_data` volume (or use a managed Postgres with
  automated backups).
- **Migrations on upgrade**: pull the new image and re-run
  `docker compose up -d --build`; the `migrate` service re-applies the schema.

---

## 2. Vercel + managed Postgres

1. Create a Postgres with pgvector (Neon, Supabase, or RDS). Enable `vector`.
2. Apply `sql/*.sql` and `sql/roles.sql` against it (step 0).
3. Import the repo in Vercel. Framework auto-detects as Next.js.
4. Set these **Environment Variables** (Production + Preview):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | `postgres://docuask_app:...@host/db?sslmode=require` |
   | `EMBED_PROVIDER` | `cloudflare` |
   | `CLOUDFLARE_ACCOUNT_ID` | your account id |
   | `CLOUDFLARE_API_TOKEN` | token with Workers AI access |
   | `LLM_BASE_URL` | `https://your-gateway/v1` (HTTPS — http:// is rejected in prod) |
   | `LLM_MODEL` | model id |
   | `LLM_API_KEY` | gateway key |
   | `SESSION_SECRET` | `openssl rand -hex 32` |
   | `ADMIN_TOKEN` | `openssl rand -hex 32` |
   | `PAYMENT_WEBHOOK_SECRET` | `openssl rand -hex 32` |

5. Deploy. Point uptime checks at `/api/health`.

### Vercel caveats

- **Rate limiting is per-instance.** Serverless scales horizontally, so the
  in-memory limiter becomes per-lambda. Move to a shared store (Upstash Redis,
  Vercel KV) before relying on it for spend protection.
- **Node runtime required.** `/api/ingest` (unpdf) and `pg` need the Node
  runtime, which the routes already declare. Do not force Edge.
- **Connection pooling.** Serverless opens many short-lived connections; use
  your provider's pooled connection string (Neon `-pooler`, Supabase `:6543`).

---

## Health check

`GET /api/health` → `200 {"ok":true}` when the database answers, `503` otherwise.
It never leaks values; with the `x-admin-token` header it also reports which
env vars are missing.
