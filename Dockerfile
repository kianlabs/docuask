# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

# ---------- deps: install node_modules only (cached unless package files change)
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder: compile the Next.js standalone bundle
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public site URL is inlined at BUILD time into prerendered routes
# (/, /robots.txt, /sitemap.xml) and OG/canonical tags — a runtime env var is
# too late for static output. Pass it via `docker build --build-arg` or compose
# `build.args`. Defaults to the local dev origin when unset.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3005
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Build-time public config only. Secrets are supplied at RUNTIME (see compose),
# never baked into the image. NEXT_TELEMETRY_DISABLED keeps builds offline-clean.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- runner: minimal runtime image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 -G nodejs nextjs

# Set correct permissions for prerender cache
RUN mkdir -p .next && chown nextjs:nodejs .next

# `output: "standalone"` emits a self-contained server + a trimmed node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# DB migrations are shipped so the container can be the schema owner if desired.
COPY --from=builder --chown=nextjs:nodejs /app/sql ./sql

USER nextjs
EXPOSE 3000

# Container-native health check hits the readiness probe (DB-aware).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
