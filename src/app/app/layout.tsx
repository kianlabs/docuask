import { SiteHeader } from "@/components/SiteHeader";

/** Authenticated workspace shell. Access is enforced by the API layer:
 *  every request 401s without a session, and /app redirects to /login. */
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
