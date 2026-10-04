import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar gratis",
  description:
    "Buat akun DocuAsk gratis — unggah PDF dan dapatkan jawaban bersitasi halaman. Tanpa kartu kredit.",
  alternates: { canonical: "/signup" },
};

/** Layout wrapper so the client signup page can carry page metadata. */
export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
