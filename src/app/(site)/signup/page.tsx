"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Field, Icon, Input } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

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
      // The signup response sets the session cookie — go straight to work.
      router.push("/app");
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
        <h1 className="text-2xl font-semibold text-ink">Buat akun gratis</h1>
        <p className="mt-1 text-sm text-muted">
          Mulai bertanya ke dokumenmu dalam hitungan menit.
        </p>
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
        <Field label="Password" hint="Minimal 8 karakter.">
          <Input
            type="password"
            autoComplete="new-password"
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
          disabled={busy || !email || password.length < 8}
        >
          {busy ? "Membuat akun…" : "Daftar"}
        </Button>
        <ul className="space-y-1.5 pt-1">
          {["3 dokumen gratis", "50 pertanyaan / bulan", "Sitasi halaman"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-muted">
              <Icon name="check" className="h-3.5 w-3.5 text-positive" />
              {f}
            </li>
          ))}
        </ul>
        <p className="text-center text-xs text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Masuk
          </Link>
        </p>
      </Card>
    </div>
  );
}
