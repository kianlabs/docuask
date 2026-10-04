"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      router.push("/account");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-1 text-2xl font-semibold text-white">Masuk</h1>
      <p className="mb-6 text-sm text-gray-400">Masuk untuk mengelola akun dan paketmu.</p>

      <div className="space-y-3 rounded-lg border border-ink-border bg-ink-card p-5">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-ink-border bg-ink px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full rounded border border-ink-border bg-ink px-3 py-2 text-sm text-white"
          />
        </div>
        {err && (
          <p className="rounded border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {err}
          </p>
        )}
        <button
          onClick={submit}
          disabled={busy || !email || !password}
          className="w-full rounded bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
        >
          {busy ? "Memproses…" : "Masuk"}
        </button>
        <p className="text-center text-xs text-gray-500">
          Belum punya akun?{" "}
          <Link href="/signup" className="text-gray-300 underline">
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
