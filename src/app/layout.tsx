import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocuAsk — tanya apa pun ke dokumenmu",
  description:
    "Upload PDF, tanya apa pun, dapat jawaban dengan sitasi halaman. RAG untuk dokumen kamu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
