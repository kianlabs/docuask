# DocuAsk — Enterprise Multi-Tenant Document Intelligence & RAG

[![CI](https://github.com/kianlabs/docuask/actions/workflows/ci.yml/badge.svg)](https://github.com/kianlabs/docuask/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
![Next.js 14](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)
![pgvector](https://img.shields.io/badge/PostgreSQL-pgvector_HNSW-336791?logo=postgresql&logoColor=white)
![Cloudflare Workers AI](https://img.shields.io/badge/Cloudflare_Workers_AI-bge--m3-F38020?logo=cloudflare&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-22_LTS-3c873a?logo=nodedotjs&logoColor=white)

Upload PDFs, ask deep analytical questions, and receive **fact-grounded answers with interactive page citations**. Built on a secure multi-tenant retrieval-augmented generation (RAG) architecture powered by PostgreSQL `pgvector`, Cloudflare Workers AI embeddings, and strict database row-level security.

---

## Architecture & Ingestion Flow

```mermaid
flowchart TD
    subgraph Client["Web Workspace & Landing (Next.js 14)"]
        UI["Workspace UI (/app) & Demo (/demo)"]
        CitModal["Interactive Citation Modal & Excerpt Drawer"]
        Upload["PDF Ingestion Portal (/api/ingest)"]
        Chat["Q&A Query Interface (/api/chat)"]
    end

    subgraph Ingestion["Ingestion Pipeline"]
        PDFParser["PDF Text & Metadata Extractor"]
        Chunker["Semantic Text Chunker (Sliding Window)"]
        Embedder["Embedding Engine (Cloudflare Workers AI BGE-M3)"]
    end

    subgraph Storage["Database & Vector Storage (PostgreSQL 18 + pgvector)"]
        HNSW[("pgvector HNSW Index (1024-dim Cosine Similarity)")]
        RLS["PostgreSQL Row-Level Security (Tenant Isolation)"]
    end

    subgraph RAGEngine["Retrieval & Inference Pipeline"]
        QueryEmbed["Query Vectorizer"]
        SimSearch["Cosine Nearest Neighbors Search"]
        FloorCheck{"Score >= Retrieval Floor?"}
        GroundedPrompt["Grounded Context Assembler (Prompt Injection Guard)"]
        LLM["OpenAI-Compatible LLM Gateway"]
        Fallback["Bypass LLM: 'Answer not found in context'"]
    end

    Upload --> PDFParser
    PDFParser --> Chunker
    Chunker --> Embedder
    Embedder -->|Store Vector + Excerpts| RLS
    RLS --> HNSW

    Chat --> QueryEmbed
    QueryEmbed --> SimSearch
    SimSearch -->|Tenant-Scoped Vector Search| HNSW
    HNSW --> SimSearch
    SimSearch --> FloorCheck
    FloorCheck -- "No" --> Fallback
    FloorCheck -- "Yes" --> GroundedPrompt
    GroundedPrompt --> LLM
    LLM --> UI
    Fallback --> UI
    UI --> CitModal
```

---

## Key Highlights & Featured Innovations

- 🔍 **Interactive Citation Modal & Source Excerpts**: Every response includes clickable `[page N]` citation pills. Clicking a citation opens an interactive slide-over drawer showing the exact verbatim document excerpt, contextual highlighting, and an instant copy button for audit compliance.
- 📚 **Cross-Document Comparative Analysis**: Ask questions that span multiple documents across your workspace library (e.g., comparing annual leave policy vs. travel reimbursement rules). DocuAsk aggregates relevant vector chunks from distinct PDFs into unified multi-document synthesis.
- 🛡️ **Dual-Layer Anti-Hallucination Guardrails**:
  1. *Retrieval Score Floor*: Evaluates vector similarity scores before calling the LLM. If chunks fail the minimum confidence threshold, the LLM is skipped entirely (`usedLlm: false`, `reason: below_retrieval_floor`).
  2. *Grounded Prompt Contracts*: Constrains the language model to synthesize responses strictly from retrieved text snippets with explicit page citations; any ungrounded claim is replaced with "Information not found in document".
- 🏢 **Multi-Tenancy with Database Row-Level Security (RLS)**: Tenant isolation is enforced at the PostgreSQL database engine level (`withTenant()` transaction scope). Even if an application query omits a filter, cross-tenant records can never be leaked or modified.
- ⚡ **Public No-Signup Demo with Durable Rate Limits**: Provides potential users with an instant sandbox experience without registration, backed by fail-closed daily caps and per-IP throttles.
- 💳 **Self-Serve Billing & Order Lifecycle**: Tiered quota enforcement (document storage count + monthly Q&A question limits), cryptographic HMAC-SHA256 payment webhooks, and administrative override capabilities.

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend & API** | Next.js 14 (App Router), React, TypeScript | Server Components, streaming Q&A, Tailwind CSS |
| **Vector Database** | PostgreSQL 18 + `pgvector` | HNSW cosine similarity index, Row-Level Security (RLS) |
| **Embeddings** | Cloudflare Workers AI (`@cf/baai/bge-m3`) | 1024-dimensional multilingual embeddings (with hash fallback) |
| **LLM Gateway** | OpenAI-Compatible API Gateway | Model-agnostic integration (OpenAI, Anthropic, local vLLM/Ollama) |
| **Security & Auth** | Scrypt + HMAC stateless session cookies | API key authentication (`x-api-key`) & session cookies |
| **DevOps & Containers**| Docker & Docker Compose | Multi-stage build, non-root execution, healthchecks |

---

## Quickstart & Running Locally

### Option A: Docker Compose (Fastest & Recommended)

Deploy the entire stack (PostgreSQL with `pgvector`, auto-applied schemas, and standalone Next.js server):

```bash
# 1. Clone repository and set environment
git clone https://github.com/kianlabs/docuask.git
cd docuask
cp .env.example .env

# 2. Configure POSTGRES_PASSWORD, DOCUASK_APP_PASSWORD, and LLM credentials in .env
# 3. Spin up services
docker compose up -d --build

# 4. Verify deployment health probe
curl -fsS http://localhost:3000/api/health
# Returns: {"ok":true,...}
```

The workspace is immediately live at [http://localhost:3000](http://localhost:3000).

---

### Option B: Local Development Environment

```bash
# 1. Launch pgvector PostgreSQL container
docker run -d --name docuask-pg \
  -e POSTGRES_USER=docuask \
  -e POSTGRES_PASSWORD=change_me_dev_pw \
  -e POSTGRES_DB=docuask \
  -p 127.0.0.1:5433:5432 \
  pgvector/pgvector:pg18

# 2. Apply database schemas and restricted non-superuser application role
export DOCUASK_APP_PASSWORD=change_me_app_pw
docker exec -i docuask-pg psql -U docuask -d docuask -f - < sql/schema.sql
docker exec -i docuask-pg psql -U docuask -d docuask -f - < sql/billing.sql
docker exec -i docuask-pg psql -U docuask -d docuask -f - < sql/accounts.sql
docker exec -i docuask-pg psql -U docuask \
  -v app_password="$DOCUASK_APP_PASSWORD" -f - < sql/roles.sql

# 3. Configure local environment
cp .env.example .env.local
# Set DATABASE_URL=postgresql://docuask_app:change_me_app_pw@localhost:5433/docuask

# 4. Install dependencies and start development server
npm install
npx next dev -p 3005
```

Open [http://localhost:3005/app](http://localhost:3005/app) to register an account, upload documents, and test queries.

---

## Sample Document Ingestion & Verification

DocuAsk includes a standalone, zero-dependency PDF document generator for testing ingestion and cross-document inquiries:

```bash
# Generate single sample policy document
python3 samples/make_sample_pdf.py samples/kebijakan-cuti-contoh.pdf

# Generate a rich 10-document multi-department enterprise library (HR, Legal, Finance, IT)
python3 samples/make_documents.py samples/library/
```

Ingest documents via REST API:

```bash
# Ingest single file
curl -H "x-api-key: $YOUR_API_KEY" \
  -F "file=@samples/kebijakan-cuti-contoh.pdf" \
  http://localhost:3005/api/ingest

# Query across ingested documents
curl -H "x-api-key: $YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"question": "Berapa hari hak cuti tahunan dan bagaimana prosedur klaim perjalanan dinas?"}' \
  http://localhost:3005/api/chat
```

---

## API Reference

All tenant endpoints accept either an API key (`x-api-key: <key>`) or a verified browser session cookie.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health probe (`200 OK` if DB is accessible, else `503`) |
| `POST` | `/api/ingest` | Multipart PDF upload → extract, chunk, embed, and store with tenant RLS |
| `GET` | `/api/ingest` | List all documents belonging to the authenticated tenant |
| `DELETE`| `/api/ingest?id=...`| Safely delete a document and purge all associated vector embeddings |
| `POST` | `/api/chat` | Query RAG pipeline: `{question, documentId?, k?}` → answer + citations |
| `GET` | `/api/chat` | Retrieve diagnostics: active embedding provider, LLM model, vector counts |
| `GET` | `/api/usage` | Inspect current plan quotas, document counts, and monthly questions |
| `POST` | `/api/auth/signup` | Register new tenant and owner user, establishing session cookie & API key |
| `POST` | `/api/auth/login` | Authenticate owner credentials and return session cookie |
| `POST` | `/api/orders` | Create pending plan upgrade order |
| `POST` | `/api/webhook/payment` | Fail-closed HMAC-SHA256 payment callback handler for billing reconciliation |

---

## Operational Verification & CI

| Concern | Implementation | Location |
|---|---|---|
| **Health Probe** | `GET /api/health` | Responds `200` on successful DB ping, `503` on failure |
| **Config Validation** | Zero-downtime startup guard | `src/lib/env.ts` & `src/instrumentation.ts` |
| **Security Headers** | HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` | `next.config.js` |
| **Continuous Integration** | GitHub Actions workflow | `.github/workflows/ci.yml` (typecheck, lint, build on live PostgreSQL) |

---

## Architectural Pitfalls (Verified Best Practices)

1. **Superuser Bypasses PostgreSQL RLS**: If the application connects with a superuser role, `FORCE ROW LEVEL SECURITY` is bypassed and multi-tenant isolation fails. Always use the unprivileged `docuask_app` role (`sql/roles.sql`).
2. **Missing Tenant Setting Fail-Closed**: `current_setting('app.tenant_id', true)` returns `NULL` when unset. In SQL, `tenant_id = NULL` evaluates to unknown/false, safely returning 0 rows. Never remove the `missing_ok` flag.
3. **Build vs. Dev Collision**: Never run `npm run build` while `next dev` is running on the same machine; shared `.next/` artifacts will corrupt.
4. **Lexical Hash Embeddings Fallback**: The hash embedder is intended strictly as a zero-credential dev fallback. In production, always configure Cloudflare Workers AI `bge-m3` or an OpenAI embedding model for semantic parity.

---

## License

This project is open-source under the [MIT License](./LICENSE) © 2026 Kian Labs.
