"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  Icon,
  QuotaBar,
  statusTone,
} from "@/components/ui";

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

const PLANS: (Plan & { tagline: string; featured?: boolean })[] = [
  {
    code: "free",
    name: "Gratis",
    price_idr: 0,
    max_documents: 3,
    max_questions: 50,
    tagline: "Untuk mencoba.",
  },
  {
    code: "pro",
    name: "Pro",
    price_idr: 99000,
    max_documents: 50,
    max_questions: 2000,
    tagline: "Untuk tim kecil & profesional.",
    featured: true,
  },
  {
    code: "bisnis",
    name: "Bisnis",
    price_idr: 499000,
    max_documents: null,
    max_questions: null,
    tagline: "Untuk organisasi.",
  },
];

const COMPARE: { label: string; values: [string, string, string] }[] = [
  { label: "Dokumen", values: ["3", "50", "Tak terbatas"] },
  { label: "Pertanyaan / bulan", values: ["50", "2.000", "Tak terbatas"] },
  { label: "Sitasi halaman", values: ["✓", "✓", "✓"] },
  { label: "Riwayat & ekspor", values: ["—", "✓", "✓"] },
  { label: "Dukungan", values: ["—", "Email", "Prioritas"] },
];

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
        router.push("/login?next=/account");
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
      setNotice(
        `Order ${j.order.order_ref} dibuat. Selesaikan pembayaran, lalu tunggu konfirmasi — paket aktif otomatis setelah lunas.`
      );
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

  if (err) {
    return (
      <div className="mx-auto max-w-[960px] px-4 py-16">
        <Alert>{err}</Alert>
      </div>
    );
  }
  if (!acct) {
    return (
      <div className="mx-auto max-w-[960px] px-4 py-16">
        <div className="h-40 animate-pulse rounded-xl bg-sunken" />
      </div>
    );
  }

  const { usage } = acct;
  const pending = acct.orders.find((o) => o.status === "pending");

  return (
    <div className="mx-auto max-w-[960px] px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-heading-1 font-bold text-ink">Dasbor akun</h1>
          <p className="mt-0.5 text-sm text-muted">{acct.email}</p>
        </div>
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-sunken"
        >
          Buka aplikasi
        </Link>
      </div>

      {notice && (
        <div className="mb-6">
          <Alert tone="positive">{notice}</Alert>
        </div>
      )}

      {pending && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-warning">
            <Icon name="clock" className="h-4 w-4" />
            <span>
              Pesanan <span className="font-medium">{pending.order_ref}</span> menunggu
              pembayaran.
            </span>
          </div>
          <Badge tone="warning">selesaikan pembayaran</Badge>
        </div>
      )}

      {/* Usage */}
      <Card className="mb-8 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-heading-3 font-semibold text-ink">Pemakaian bulan ini</h2>
          <Badge tone="accent">{usage.plan.name}</Badge>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <QuotaBar label="Dokumen" used={usage.documents} max={usage.plan.max_documents} />
          <QuotaBar label="Pertanyaan" used={usage.questions} max={usage.plan.max_questions} />
        </div>
      </Card>

      {/* Plans — Good / Better / Best */}
      <section className="mb-10">
        <h2 className="mb-1 font-heading text-heading-2 font-semibold text-ink">Paket</h2>
        <p className="mb-4 text-xs text-muted">
          Tingkatkan kapan saja. Paket aktif setelah pembayaran dikonfirmasi.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((p) => {
            const current = p.code === acct.planCode;
            return (
              <Card
                key={p.code}
                className={`relative flex flex-col p-5 ${
                  p.featured ? "rounded-2xl border-accent ring-1 ring-accent" : ""
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge tone="accent">Direkomendasikan</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-heading-2 font-semibold text-ink">{p.name}</h3>
                  {current && <Badge tone="positive">Paket aktif</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted">{p.tagline}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-ink">
                    {p.price_idr === 0
                      ? "Rp 0"
                      : "Rp " + p.price_idr.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-muted">/bulan</span>
                </div>
                <p className="mt-3 flex-1 text-xs text-muted">
                  {p.max_documents === null ? "∞" : p.max_documents} dokumen ·{" "}
                  {p.max_questions === null ? "∞" : p.max_questions} pertanyaan
                </p>
                <Button
                  className="mt-4 w-full"
                  variant={p.featured ? "primary" : "secondary"}
                  disabled={busy || current || p.price_idr === 0}
                  onClick={() => buy(p.code)}
                >
                  {current ? "Paket aktif" : p.price_idr === 0 ? "Termasuk" : "Pilih paket"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section className="mb-10">
        <h2 className="mb-3 font-heading text-heading-2 font-semibold text-ink">Perbandingan paket</h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="px-4 py-3 font-medium">Fitur</th>
                {PLANS.map((p) => (
                  <th
                    key={p.code}
                    className={`px-4 py-3 font-medium ${p.featured ? "text-accent-hover" : ""}`}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-muted">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="px-4 py-3 text-ink">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Orders */}
      <section className="mb-10">
        <h2 className="mb-3 font-heading text-heading-2 font-semibold text-ink">Riwayat pesanan</h2>
        {acct.orders.length === 0 ? (
          <p className="text-sm text-muted">Belum ada pesanan.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Referensi</th>
                  <th className="px-4 py-3 font-medium">Paket</th>
                  <th className="px-4 py-3 font-medium">Jumlah</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {acct.orders.map((o) => (
                  <tr key={o.order_ref} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-muted">{o.order_ref}</td>
                    <td className="px-4 py-3 capitalize text-ink">{o.plan_code}</td>
                    <td className="px-4 py-3 text-ink">
                      {"Rp " + o.amount_idr.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {o.status === "pending" && (
                        <button
                          onClick={() => cancelOrder(o.order_ref)}
                          disabled={busy}
                          className="text-xs text-muted hover:text-danger"
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

      {/* Developer / API key */}
      <section>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-heading-3 font-semibold text-ink">API key</h2>
              <p className="mt-0.5 text-xs text-muted">
                Untuk developer & akses programatik. Di aplikasi kamu tidak perlu ini.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowKey((v) => !v)}>
                {showKey ? "Sembunyikan" : "Tampilkan"}
              </Button>
              <Button variant="secondary" size="sm" onClick={rotateKey} disabled={busy}>
                Ganti key
              </Button>
            </div>
          </div>
          <code className="mt-3 block break-all rounded-lg border border-line bg-sunken px-3 py-2 font-mono text-xs text-ink">
            {showKey ? acct.apiKey : "•".repeat(32)}
          </code>
          <p className="mt-2 text-xs text-muted">
            Pakai sebagai header{" "}
            <code className="rounded bg-sunken px-1 py-0.5 font-mono text-ink">x-api-key</code>{" "}
            pada panggilan API.
          </p>
        </Card>
      </section>
    </div>
  );
}
