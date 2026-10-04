"use client";

import { useState } from "react";

interface TenantRow {
  id: number;
  name: string;
  api_key: string;
  plan_code: string;
  subscription_status: string;
  documents: number;
  questions: number;
  max_documents: number | null;
  max_questions: number | null;
  price_idr: number;
}

function fmtLimit(v: number | null) {
  return v === null ? "∞" : String(v);
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<TenantRow[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/admin", { headers: { "x-admin-token": token } });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setRows(j.tenants);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setRows([]);
    } finally {
      setBusy(false);
    }
  }

  async function changePlan(tenantId: number, planCode: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, planCode }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-white">DocuAsk — Admin</h1>
      <p className="mb-6 text-sm text-gray-400">
        Semua tenant, paket, dan pemakaian bulan ini.
      </p>

      <div className="mb-6 flex gap-2 rounded-lg border border-ink-border bg-ink-card p-4">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="ADMIN_TOKEN"
          className="flex-1 rounded border border-ink-border bg-ink px-3 py-2 text-sm text-white"
        />
        <button
          onClick={load}
          disabled={busy || !token}
          className="rounded bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
        >
          Muat
        </button>
      </div>

      {err && (
        <p className="mb-4 rounded border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {err}
        </p>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-ink-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-card text-xs text-gray-400">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">API key</th>
                <th className="px-3 py-2">Paket</th>
                <th className="px-3 py-2">Dokumen</th>
                <th className="px-3 py-2">Pertanyaan</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Ubah paket</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-t border-ink-border text-gray-200">
                  <td className="px-3 py-2">{t.id}</td>
                  <td className="px-3 py-2 font-mono text-xs">{t.api_key}</td>
                  <td className="px-3 py-2">{t.plan_code}</td>
                  <td className="px-3 py-2">
                    {t.documents}/{fmtLimit(t.max_documents)}
                  </td>
                  <td className="px-3 py-2">
                    {t.questions}/{fmtLimit(t.max_questions)}
                  </td>
                  <td className="px-3 py-2">{t.subscription_status}</td>
                  <td className="px-3 py-2">
                    <select
                      value={t.plan_code}
                      onChange={(e) => changePlan(t.id, e.target.value)}
                      className="rounded border border-ink-border bg-ink px-2 py-1 text-xs text-white"
                    >
                      <option value="free">free</option>
                      <option value="pro">pro</option>
                      <option value="bisnis">bisnis</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!rows.length && !err && (
        <p className="text-sm text-gray-500">
          Masukkan ADMIN_TOKEN lalu klik Muat.
        </p>
      )}
    </main>
  );
}
