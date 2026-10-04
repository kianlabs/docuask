"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, Logo } from "@/components/ui";

/**
 * Route-level error boundary. Catches render/data errors below the root layout
 * so one broken page does not blank the whole app. `reset()` retries the
 * segment; the home link is the escape hatch when retrying cannot help.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the browser console and the server log (never to the UI).
    console.error("[app:error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo className="mb-8" />
      <h1 className="font-heading text-heading-3 font-semibold text-ink">
        Ada yang tidak beres
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Terjadi kesalahan saat memuat halaman ini. Coba lagi — kalau tetap
        gagal, kembali ke beranda.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted">Kode: {error.digest}</p>
      )}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Coba lagi</Button>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-sunken"
        >
          Ke beranda
        </Link>
      </div>
    </div>
  );
}
