import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke ruang kerja DocuAsk untuk bertanya ke dokumenmu.",
  alternates: { canonical: "/login" },
};

/** Layout wrapper so the client login page can carry page metadata. */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
