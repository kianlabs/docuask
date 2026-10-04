import Link from "next/link";
import { LinkButton, Logo } from "@/components/ui";

/**
 * 404 — the visitor asked for something that does not exist.
 * A dead end is a conversion killer, so always offer a way forward.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo className="mb-8" />
      <p className="font-heading text-display font-bold text-ink">404</p>
      <h1 className="mt-2 font-heading text-heading-3 font-semibold text-ink">
        Halaman ini tidak ada
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Tautannya mungkin salah ketik, atau halamannya sudah dipindahkan.
      </p>
      <div className="mt-8 flex gap-3">
        <LinkButton href="/">Ke beranda</LinkButton>
        <LinkButton href="/app" variant="secondary">
          Buka ruang kerja
        </LinkButton>
      </div>
      <Link href="/login" className="mt-8 text-xs text-muted hover:text-ink">
        Sudah punya akun? Masuk
      </Link>
    </div>
  );
}
