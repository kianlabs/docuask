"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [apiKey, setApiKey] = useState("");

  async function submit() {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setApiKey(j.apiKey);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (apiKey) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="mb-2 text-2xl font-semibold text-white">Akun dibuat 🎉</h1>
        <p className="mb-4 text-sm text-gray-400">
          Simpan API key ini. Kamu juga bisa melihatnya kapan saja di dasbor.
        </p>
        <code className="block break-all rounded border border-ink-border bg-ink-card px-3 py-2 font-mono text-xs text-emerald-300">
          {apiKey}
        </code>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push("/account")}
            className="rounded bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Buka dasbor
          </button>
          <Link href="/" className="rounded border border-ink-border px-4 py-2 text-sm text-gray-300">
            Ke aplikasi
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-1 text-2xl font-semibold text-white">Daftar akun</h1>
      <p className="mb-6 text-sm text-gray-400">
        Buat akun untuk mendapatkan API key dan paket gratis.
      </p>

      <div className="space-y-3 rounded-lg border border-ink-border bg-ink-card p-5">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@contoh.com"
            className="w-full rounded border border-ink-border bg-ink px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Password (min. 8 karakter)</label>
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
          disabled={busy || !email || password.length < 8}
          className="w-full rounded bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
        >
          {busy ? "Memproses…" : "Daftar"}
        </button>
        <p className="text-center text-xs text-gray-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-gray-300 underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
