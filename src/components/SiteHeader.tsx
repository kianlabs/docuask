"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Badge, Button, Icon, LinkButton, Logo } from "./ui";

interface Me {
  email: string;
  planCode: string;
}

/** Human-friendly plan label for the header badge. */
const PLAN_LABEL: Record<string, string> = {
  free: "Gratis",
  pro: "Pro",
  bisnis: "Bisnis",
};

/**
 * Shared top bar. It probes /api/account to decide whether to show the
 * signed-in actions (Aplikasi / Akun / Keluar) or the public ones.
 */
export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/account")
      .then(async (r) => {
        if (!alive) return;
        if (r.ok) {
          const j = await r.json();
          setMe({ email: j.account.email, planCode: j.account.planCode });
        } else {
          setMe(null);
        }
      })
      .catch(() => alive && setMe(null))
      .finally(() => alive && setChecked(true));
    return () => {
      alive = false;
    };
  }, [pathname]);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between px-4">
        <Link href="/" className="shrink-0" aria-label="DocuAsk — beranda">
          <Logo />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/app"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-sunken hover:text-ink sm:block"
          >
            Aplikasi
          </Link>
          <a
            href="/#harga"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-sunken hover:text-ink sm:block"
          >
            Harga
          </a>

          {!checked ? (
            <span className="h-8 w-24 animate-pulse rounded-lg bg-sunken" />
          ) : me ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-sunken"
                title={me.email}
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-soft text-xs font-semibold uppercase text-accent-hover">
                  {me.email.slice(0, 1)}
                </span>
                <Badge tone="accent" className="hidden sm:inline-flex">
                  {PLAN_LABEL[me.planCode] ?? me.planCode}
                </Badge>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} title="Keluar">
                <Icon name="logout" className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <LinkButton href="/login" variant="ghost" size="sm">
                Masuk
              </LinkButton>
              <LinkButton href="/signup" variant="primary" size="sm">
                Coba gratis
              </LinkButton>
            </div>
          )}

          {/* Mobile menu — the inline links above are hidden below `sm`. */}
          <div className="relative sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Icon name="menu" className="h-5 w-5" />
            </Button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-pop">
                  <Link
                    href="/app"
                    className="block px-4 py-2 text-sm text-muted hover:bg-sunken hover:text-ink"
                  >
                    Aplikasi
                  </Link>
                  <a
                    href="/#harga"
                    className="block px-4 py-2 text-sm text-muted hover:bg-sunken hover:text-ink"
                  >
                    Harga
                  </a>
                  {me && (
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-muted hover:bg-sunken hover:text-ink"
                    >
                      Akun
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
