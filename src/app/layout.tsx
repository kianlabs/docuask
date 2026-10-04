import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocuAsk — tanya apa pun ke dokumenmu",
  description:
    "Upload PDF, tanya apa pun, dapat jawaban dengan sitasi halaman. RAG MVP.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-ink text-white antialiased">{children}</body>
    </html>
  );
}
