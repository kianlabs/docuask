"use client";

import { useState } from "react";
import { Alert, Badge, Button, Card, Input, statusTone } from "@/components/ui";

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

interface OrderRow {
  order_ref: string;
  tenant_id: number;
  plan_code: string;
  amount_idr: number;
  status: string;
  provider: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<TenantRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    setErr("");
    try {
      const [tr, or] = await Promise.all([
        fetch("/api/admin", { headers: { "x-admin-token": token } }),
        fetch("/api/admin/orders", { headers: { "x-admin-token": token } }),
      ]);
      const tj = await tr.json();
      if (!tr.ok) throw new Error(tj.error || `HTTP ${tr.status}`);
      setRows(tj.tenants);
      const oj = await or.json();
      if (or.ok) setOrders(oj.orders);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setRows([]);
      setOrders([]);
    } finally {
      setBusy(false);
    }
  }

  async function confirmOrder(orderRef: string) {
    if (!confirm(`Tandai order ${orderRef} LUNAS dan naikkan paket tenant?`)) return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef }),
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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink">Admin</h1>
      <p className="mt-1 text-sm text-muted">
        Semua tenant, paket, dan pemakaian bulan ini.
      </p>

      <Card className="mt-6 flex gap-2 p-4">
        <Input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="ADMIN_TOKEN"
        />
        <Button onClick={load} disabled={busy || !token}>
          {busy ? "Memuat…" : "Muat"}
        </Button>
      </Card>

      {err && (
        <div className="mt-4">
          <Alert>{err}</Alert>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">API key</th>
                <th className="px-4 py-3 font-medium">Paket</th>
                <th className="px-4 py-3 font-medium">Dokumen</th>
                <th className="px-4 py-3 font-medium">Pertanyaan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ubah paket</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-muted">{t.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{t.api_key}</td>
                  <td className="px-4 py-3 capitalize text-ink">{t.plan_code}</td>
                  <td className="px-4 py-3 text-muted">
                    {t.documents}/{t.max_documents === null ? "∞" : t.max_documents}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {t.questions}/{t.max_questions === null ? "∞" : t.max_questions}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(t.subscription_status)}>
                      {t.subscription_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={t.plan_code}
                      onChange={(e) => changePlan(t.id, e.target.value)}
                      className="rounded-lg border border-line-strong bg-surface px-2 py-1 text-xs text-ink"
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
        <p className="mt-6 text-sm text-muted">
          Masukkan ADMIN_TOKEN lalu klik Muat.
        </p>
      )}

      <h2 className="mb-3 mt-10 text-lg font-medium text-ink">Pesanan</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-muted">Belum ada pesanan.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Tenant</th>
                <th className="px-4 py-3 font-medium">Paket</th>
                <th className="px-4 py-3 font-medium">Jumlah</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.order_ref} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{o.order_ref}</td>
                  <td className="px-4 py-3 text-muted">{o.tenant_id}</td>
                  <td className="px-4 py-3 capitalize text-ink">{o.plan_code}</td>
                  <td className="px-4 py-3 text-ink">
                    {"Rp " + o.amount_idr.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {o.status === "pending" && (
                      <Button size="sm" onClick={() => confirmOrder(o.order_ref)} disabled={busy}>
                        Tandai lunas
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
