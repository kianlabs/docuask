"use client";

import { useEffect, useState } from "react";

interface Citation {
  filename: string;
  page: number;
  score: number;
  snippet: string;
}

interface Doc {
  id: number;
  filename: string;
  pages: number;
  chunks: number;
  created_at: string;
}

interface Msg {
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  usedLlm?: boolean;
  reason?: string;
}

interface Usage {
  documents: number;
  questions: number;
  plan: { code: string; name: string; max_documents: number | null; max_questions: number | null };
  remainingDocuments: number | null;
  remainingQuestions: number | null;
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState("");
  const [diag, setDiag] = useState<Record<string, unknown> | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);

  async function loadUsage() {
    try {
      const r = await fetch("/api/usage", { headers: { "x-api-key": apiKey } });
      const j = await r.json();
      if (r.ok) setUsage(j.usage);
    } catch {
      /* ignore */
    }
  }

  async function loadDiag() {
    try {
      const r = await fetch("/api/chat", { headers: { "x-api-key": apiKey } });
      setDiag(await r.json());
    } catch {
      setDiag({ ok: false });
    }
  }

  async function loadDocs() {
    try {
      const r = await fetch("/api/ingest", { headers: { "x-api-key": apiKey } });
      const j = await r.json();
      setDocs(j.documents ?? []);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadDiag();
    loadDocs();
    loadUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function upload() {
    if (!file) return;
    setBusy(true);
    setStatus("Mengunggah & memproses…");
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/ingest", {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: form,
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setStatus(
        `✓ ${j.filename}: ${j.pages} halaman, ${j.chunks} chunk (embed: ${j.embedModel})`
      );
      setFile(null);
      await loadDocs();
      await loadDiag();
      await loadUsage();
    } catch (e) {
      setStatus(`✗ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function ask() {
    const q = question.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: j.answer,
          citations: j.citations,
          usedLlm: j.usedLlm,
          reason: j.reason,
        },
      ]);
      await loadUsage();
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `Error: ${e instanceof Error ? e.message : e}` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const embed = diag?.embed as { provider?: string; dims?: number } | undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">DocuAsk</h1>
        <p className="text-sm text-gray-400">
          Upload PDF, tanya apa pun, dapat jawaban dengan sitasi halaman.
        </p>
        {diag && (
          <p className="mt-2 text-xs text-gray-500">
            embed: <span className="text-gray-300">{embed?.provider ?? "?"}</span>
            {embed?.dims ? ` (${embed.dims}d)` : ""} · tenant:{" "}
            <span className="text-gray-300">
              {(diag.tenantName as string) ?? "unauthenticated"}
            </span>
          </p>
        )}
        {usage && (
          <p className="mt-1 text-xs text-gray-500">
            paket: <span className="text-gray-300">{usage.plan.name}</span> · dokumen:{" "}
            <span className="text-gray-300">
              {usage.documents}/{usage.plan.max_documents ?? "∞"}
            </span>{" "}
            · pertanyaan:{" "}
            <span className="text-gray-300">
              {usage.questions}/{usage.plan.max_questions ?? "∞"}
            </span>
          </p>
        )}
      </header>

      <section className="mb-6 rounded-lg border border-ink-border bg-ink-card p-4">
        <label className="mb-1 block text-xs text-gray-400">API key (tenant)</label>
        <div className="flex gap-2">
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="your-tenant-api-key"
            onBlur={() => {
              loadDiag();
              loadDocs();
            }}
            className="flex-1 rounded border border-ink-border bg-ink px-3 py-2 text-sm text-white"
          />
        </div>

        <label className="mb-1 mt-4 block text-xs text-gray-400">Dokumen (PDF)</label>
        <div className="flex gap-2">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="flex-1 text-sm text-gray-300"
          />
          <button
            onClick={upload}
            disabled={!file || busy}
            className="rounded bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            Upload
          </button>
        </div>
        {status && <p className="mt-2 text-xs text-gray-400">{status}</p>}

        {docs.length > 0 && (
          <ul className="mt-3 space-y-1">
            {docs.map((d) => (
              <li key={d.id} className="text-xs text-gray-500">
                • {d.filename} — {d.pages} hal, {d.chunks} chunk
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-ink-border bg-ink-card p-4">
        <div className="mb-4 max-h-[45vh] space-y-3 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-gray-500">
              Belum ada pertanyaan. Upload PDF dulu, lalu tanya.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div
                className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-white text-black"
                    : "bg-ink-hover text-gray-100"
                }`}
              >
                {m.text}
              </div>
              {m.role === "assistant" && m.citations && m.citations.length > 0 && (
                <details className="mt-1 text-left">
                  <summary className="cursor-pointer text-xs text-gray-500">
                    {m.usedLlm === false ? "(tanpa LLM) " : ""}
                    {m.citations.length} sumber
                  </summary>
                  <ul className="mt-1 space-y-1">
                    {m.citations.map((c, j) => (
                      <li key={j} className="text-xs text-gray-400">
                        p.{c.page} ({c.score}) — {c.snippet}…
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="Tanya apa pun tentang dokumen…"
            className="flex-1 rounded border border-ink-border bg-ink px-3 py-2 text-sm text-white"
          />
          <button
            onClick={ask}
            disabled={busy || !question.trim()}
            className="rounded bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            Tanya
          </button>
        </div>
      </section>
    </main>
  );
}
