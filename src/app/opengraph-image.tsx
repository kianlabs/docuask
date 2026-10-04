import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "DocuAsk — tanya apa pun ke dokumenmu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card. Rendered at request/build time from the design tokens
 * (warm canvas + teal accent), so it stays in sync with the product instead of
 * being a stale hand-made PNG. Kept text-only: no stock imagery, no gradients.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f7f6f3",
          color: "#1a1a1e",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#1a7578",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
            DocuAsk
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            Tanya apa pun ke dokumenmu.
          </div>
          <div style={{ fontSize: 30, color: "#64696f", maxWidth: 860, lineHeight: 1.35 }}>
            Unggah PDF, ajukan pertanyaan, dapat jawaban yang menunjuk halaman
            sumbernya.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 24,
            color: "#64696f",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "#1a7578" }} />
          Jawaban bersitasi halaman · anti-halusinasi
        </div>
      </div>
    ),
    { ...size }
  );
}
