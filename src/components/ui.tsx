/**
 * Shared presentational primitives for the light "workspace" UI.
 *
 * These are dependency-free and receive handlers as props, so they can be used
 * from both server and client components.
 */
import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes, HTMLAttributes } from "react";

/* --------------------------------- Button -------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-accent-hover shadow-card disabled:hover:bg-primary",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-sunken disabled:hover:bg-surface",
  ghost: "bg-canvas text-muted hover:bg-sunken hover:text-ink",
  danger:
    "bg-surface text-danger border border-line-strong hover:bg-danger-soft disabled:hover:bg-surface",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- Card --------------------------------- */

export function Card({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/* --------------------------------- Badge --------------------------------- */

type Tone = "neutral" | "accent" | "positive" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-sunken text-muted border-line",
  accent: "bg-accent-soft text-accent-hover border-accent-ring",
  positive: "bg-positive-soft text-positive border-positive/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/20",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}

/** Map an order/subscription status to a badge tone. */
export function statusTone(status: string): Tone {
  if (status === "paid" || status === "active") return "positive";
  if (status === "pending") return "warning";
  if (status === "cancelled" || status === "expired" || status === "failed")
    return "danger";
  return "neutral";
}

/* --------------------------------- Input --------------------------------- */

export function Input({
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring ${className}`}
      {...rest}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

/* --------------------------------- Alert --------------------------------- */

export function Alert({
  tone = "danger",
  children,
}: {
  tone?: "danger" | "positive" | "warning" | "info";
  children: ReactNode;
}) {
  const map = {
    danger: "border-danger/20 bg-danger-soft text-danger",
    positive: "border-positive/20 bg-positive-soft text-positive",
    warning: "border-warning/20 bg-warning-soft text-warning",
    info: "border-accent-ring bg-accent-soft text-accent-hover",
  } as const;
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${map[tone]}`} role="status">
      {children}
    </div>
  );
}

/* -------------------------------- QuotaBar ------------------------------- */

export function QuotaBar({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number | null;
}) {
  const unlimited = max === null;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(max!, 1)) * 100));
  const near = !unlimited && pct >= 80;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span className="font-medium text-muted">{label}</span>
        <span className={near ? "font-medium text-warning" : "text-muted"}>
          {used}
          {unlimited ? " · tak terbatas" : ` / ${max}`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-sunken">
        <div
          className={`h-full rounded-full transition-all ${
            near ? "bg-warning" : "bg-accent"
          }`}
          style={{ width: unlimited ? "8%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------- EmptyState ------------------------------ */

export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface/60 px-6 py-10 text-center">
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/* --------------------------------- LinkBtn ------------------------------- */

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {children}
    </Link>
  );
}

/* ---------------------------------- Logo --------------------------------- */

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-heading font-bold tracking-tight text-ink ${className}`}>
      <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      DocuAsk
    </span>
  );
}

/* ---------------------------------- Icons -------------------------------- */

export function Icon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    upload: (
      <path
        d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    send: (
      <path
        d="M4 12l16-8-6 16-3-6-7-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    ),
    file: (
      <path
        d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    ),
    copy: (
      <>
        <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    check: (
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
    refresh: (
      <path
        d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    logout: (
      <path
        d="M15 12H4m0 0 3-3m-3 3 3 3M12 4h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    trash: (
      <>
        <path
          d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
    menu: (
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    ),
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      {paths[name] ?? null}
    </svg>
  );
}

/** Three-dot "thinking" indicator. */
export function Dots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} role="status" aria-label="Memproses">
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-muted [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-muted [animation-delay:200ms]" />
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-muted [animation-delay:400ms]" />
    </span>
  );
}
