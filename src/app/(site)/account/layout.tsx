import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Akun",
  robots: { index: false, follow: false },
};

/** Layout wrapper so the client account page can carry noindex metadata. */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
