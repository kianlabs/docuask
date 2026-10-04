import { NextRequest, NextResponse } from "next/server";
import { pdfToPages, chunkPages } from "@/lib/pdf";
import { embed } from "@/lib/embed";
import { insertDocument, listDocuments, deleteDocument, stats } from "@/lib/store";
import { authenticate } from "@/lib/auth";
import { assertQuota, recordUsage, QuotaExceededError } from "@/lib/billing";
import { serverError, badRequest } from "@/lib/http";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth.tenant) {
      return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
    }
    const tenantId = auth.tenant.id;

    // Rate limit: 10 ingest requests per minute per tenant.
    const rl = rateLimit(`ingest:${tenantId}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    // Quota check BEFORE doing any work (and before paying for embeddings).
    try {
      await assertQuota(tenantId, "documents");
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        return NextResponse.json(
          { error: err.message, metric: err.metric, limit: err.limit, used: err.used },
          { status: 402 }
        );
      }
      throw err;
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return badRequest("no file provided");
    }
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `file too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)` },
        { status: 413 }
      );
    }
    if (!/\.pdf$/i.test(file.name)) {
      return badRequest("only .pdf files supported");
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const pages = await pdfToPages(buffer);
    const textChunks = chunkPages(pages).filter((c) => c.text.length > 20);
    if (textChunks.length === 0) {
      return NextResponse.json(
        { error: "no extractable text (scanned/image-only PDF?)" },
        { status: 422 }
      );
    }

    const { vectors, model } = await embed(textChunks.map((c) => c.text));
    const chunks = textChunks.map((c, i) => ({ ...c, vector: vectors[i] }));
    const documentId = await insertDocument(
      tenantId,
      file.name,
      pages.length,
      chunks,
      model
    );

    // Meter only after success.
    await recordUsage(tenantId, "ingest", 1, {
      filename: file.name,
      pages: pages.length,
      chunks: chunks.length,
      embedModel: model,
    });

    return NextResponse.json({
      ok: true,
      tenantId,
      documentId,
      filename: file.name,
      pages: pages.length,
      chunks: chunks.length,
      embedModel: model,
      store: await stats(tenantId),
    });
  } catch (err) {
    return serverError("ingest.POST", err);
  }
}

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth.tenant) {
    return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
  }
  return NextResponse.json({
    tenantId: auth.tenant.id,
    documents: await listDocuments(auth.tenant.id),
    store: await stats(auth.tenant.id),
  });
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth.tenant) {
      return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
    }
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return badRequest("valid document id required");
    }
    const filename = await deleteDocument(auth.tenant.id, id);
    if (filename === null) {
      return NextResponse.json({ error: "document not found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      deleted: { id, filename },
      store: await stats(auth.tenant.id),
    });
  } catch (err) {
    return serverError("ingest.DELETE", err);
  }
}
