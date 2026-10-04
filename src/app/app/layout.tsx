import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";

/** Authenticated workspace shell. Access is enforced by the API layer:
 *  every request 401s without a session, and /app redirects to /login. */
export const metadata: Metadata = {
  // Private, session-gated: never index.
  robots: { index: false, follow: false },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
