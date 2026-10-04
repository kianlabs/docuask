"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Card, Field, Input } from "@/components/ui";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Only accept an internal path. Reject leading "//" or "/\" (which browsers
  // normalise to an authority) and any non-path scheme (javascript:, https:…).
  const rawNext = params.get("next") || "/app";
  const next = /^\/(?![/\\])/.test(rawNext) ? rawNext : "/app";
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
      router.push(next);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-heading-1 font-bold text-ink">Selamat datang kembali</h1>
        <p className="mt-1 text-sm text-muted">Masuk untuk melanjutkan ke ruang kerja.</p>
      </div>

      <Card className="space-y-4 p-6">
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@contoh.com"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="••••••••"
          />
        </Field>
        {err && <Alert>{err}</Alert>}
        <Button
          className="w-full"
          onClick={submit}
          disabled={busy || !email || !password}
        >
          {busy ? "Memproses…" : "Masuk"}
        </Button>
        <p className="text-center text-xs text-muted">
          Belum punya akun?{" "}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            Daftar gratis
          </Link>
        </p>
      </Card>
    </div>
  );
}
