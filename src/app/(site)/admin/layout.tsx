import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Layout wrapper so the client admin page can carry noindex metadata. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
