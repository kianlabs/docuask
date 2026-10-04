"use client";

/**
 * Last-resort boundary: catches errors thrown by the root layout itself, so it
 * must render its own <html>/<body>. Kept dependency-free (no shared UI, no
 * font variables) because the layout that would provide them has failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          textAlign: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          background: "#f7f6f3",
          color: "#1a1a1e",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
          Aplikasi gagal dimuat
        </h1>
        <p style={{ marginTop: 12, maxWidth: 420, fontSize: 14, color: "#64696f" }}>
          Terjadi kesalahan fatal. Muat ulang halaman; kalau masih gagal, coba
          lagi beberapa saat.
        </p>
        {error.digest && (
          <p style={{ marginTop: 8, fontSize: 12, color: "#64696f" }}>
            Kode: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          style={{
            marginTop: 24,
            height: 40,
            padding: "0 20px",
            border: "none",
            borderRadius: 8,
            background: "#1a7578",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Muat ulang
        </button>
      </body>
    </html>
  );
}
