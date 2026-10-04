"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Plan {
  code: string;
  name: string;
  price_idr: number;
  max_documents: number | null;
  max_questions: number | null;
}

interface Order {
  order_ref: string;
  plan_code: string;
  amount_idr: number;
  status: string;
  created_at: string;
}

interface Usage {
  documents: number;
  questions: number;
  plan: Plan;
  remainingDocuments: number | null;
  remainingQuestions: number | null;
}

interface Account {
  email: string;
  tenantId: number;
  apiKey: string;
  planCode: string;
  usage: Usage;
  orders: Order[];
}

const PLANS: Plan[] = [
  { code: "free", name: "Free", price_idr: 0, max_documents: 3, max_questions: 50 },
  { code: "pro", name: "Pro", price_idr: 99000, max_documents: 50, max_questions: 2000 },
  { code: "bisnis", name: "Bisnis", price_idr: 499000, max_documents: null, max_questions: null },
];

function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function fmtLimit(v: number | null) {
  return v === null ? "∞" : String(v);
}

export default function AccountPage() {
  const router = useRouter();
  const [acct, setAcct] = useState<Account | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/account");
      const j = await r.json();
      if (r.status === 401) {
        router.push("/login");
        return;
      }
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setAcct(j.account);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function buy(planCode: string) {
    setBusy(true);
    setErr("");
    setNotice("");
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setNotice(`Order ${j.order.order_ref} dibuat. Selesaikan pembayaran, lalu tunggu konfirmasi.`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function cancelOrder(ref: string) {
    setBusy(true);
    try {
      const r = await fetch(`/api/orders?ref=${encodeURIComponent(ref)}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function rotateKey() {
    if (!confirm("Ganti API key? Key lama akan langsung tidak berlaku.")) return;
    setBusy(true);
    try {
      const r = await fetch("/api/account/rotate-key", { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setShowKey(true);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (err) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="rounded border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {err}
        </p>
      </main>
    );
  }
  if (!acct) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm text-gray-500">Memuat…</p>
      </main>
    );
  }

  const { usage } = acct;
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dasbor akun</h1>
          <p className="text-sm text-gray-400">{acct.email}</p>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-white">
          Keluar
        </button>
      </div>

      {notice && (
        <p className="mb-4 rounded border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
          {notice}
        </p>
      )}

      <section className="mb-6 rounded-lg border border-ink-border bg-ink-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">API key</h2>
          <div className="flex gap-3 text-xs">
            <button onClick={() => setShowKey((v) => !v)} className="text-gray-400 hover:text-white">
              {showKey ? "Sembunyikan" : "Tampilkan"}
            </button>
            <button onClick={rotateKey} disabled={busy} className="text-gray-400 hover:text-white">
              Ganti key
            </button>
          </div>
        </div>
        <code className="mt-2 block break-all rounded border border-ink-border bg-ink px-3 py-2 font-mono text-xs text-gray-200">
          {showKey ? acct.apiKey : "•".repeat(32)}
        </code>
        <p className="mt-2 text-xs text-gray-500">
          Pakai key ini sebagai header <code className="text-gray-300">x-api-key</code> di{" "}
          <Link href="/" className="text-gray-300 underline">
            aplikasi
          </Link>
          .
        </p>
      </section>

      <section className="mb-6 rounded-lg border border-ink-border bg-ink-card p-4">
        <h2 className="mb-2 text-sm font-medium text-white">
          Paket: <span className="text-emerald-300">{usage.plan.name}</span>
        </h2>
        <p className="text-xs text-gray-500">
          Dokumen: {usage.documents}/{fmtLimit(usage.plan.max_documents)} · Pertanyaan:{" "}
          {usage.questions}/{fmtLimit(usage.plan.max_questions)} (bulan ini)
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-white">Upgrade paket</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => {
            const current = p.code === acct.planCode;
            return (
              <div key={p.code} className="rounded-lg border border-ink-border bg-ink-card p-4">
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="mb-2 text-xs text-gray-400">
                  {p.price_idr === 0 ? "Gratis" : rupiah(p.price_idr)}
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  {fmtLimit(p.max_documents)} dok · {fmtLimit(p.max_questions)} tanya
                </p>
                <button
                  disabled={busy || current || p.price_idr === 0}
                  onClick={() => buy(p.code)}
                  className="w-full rounded bg-white px-3 py-1.5 text-xs font-medium text-black disabled:opacity-40"
                >
                  {current ? "Paket aktif" : p.price_idr === 0 ? "—" : "Beli"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-white">Riwayat order</h2>
        {acct.orders.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada order.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-ink-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-card text-xs text-gray-400">
                <tr>
                  <th className="px-3 py-2">Ref</th>
                  <th className="px-3 py-2">Paket</th>
                  <th className="px-3 py-2">Jumlah</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {acct.orders.map((o) => (
                  <tr key={o.order_ref} className="border-t border-ink-border text-gray-200">
                    <td className="px-3 py-2 font-mono text-xs">{o.order_ref}</td>
                    <td className="px-3 py-2">{o.plan_code}</td>
                    <td className="px-3 py-2">{rupiah(o.amount_idr)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          o.status === "paid"
                            ? "text-emerald-300"
                            : o.status === "cancelled"
                              ? "text-gray-500"
                              : "text-amber-300"
                        }
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {o.status === "pending" && (
                        <button
                          onClick={() => cancelOrder(o.order_ref)}
                          disabled={busy}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Batalkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
