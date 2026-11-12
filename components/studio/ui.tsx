import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Purpose } from "@/lib/storyboard/types";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-forest text-cream shadow-soft hover:bg-forest-deep disabled:bg-forest/40 disabled:shadow-none",
  secondary:
    "bg-paper text-forest ring-1 ring-inset ring-line hover:bg-forest-tint hover:ring-forest/30 disabled:bg-paper disabled:text-ink-subtle disabled:ring-line",
  ghost: "text-ink-muted hover:bg-sage hover:text-forest disabled:bg-transparent disabled:text-ink-subtle/60",
  danger: "text-error hover:bg-error-tint disabled:bg-transparent disabled:text-error/40",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  const sizing = size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4.5 text-sm";
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold tracking-[-0.005em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed ${sizing} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export const inputClass =
  "block w-full rounded-xl border border-line-strong bg-field px-3.5 py-2.5 text-[15px] leading-6 text-ink placeholder:text-ink-subtle transition-[border-color,box-shadow,background-color] hover:border-forest/60 focus:border-forest focus:bg-paper focus:outline-none focus:ring-[3px] focus:ring-forest/20 aria-[invalid=true]:border-error aria-[invalid=true]:bg-error-tint/40 aria-[invalid=true]:focus:ring-error/15";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2 text-[13px] font-semibold text-ink">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-ink-subtle">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-error">{error}</p>
      ) : (
        hint && <p className="text-xs leading-5 text-ink-muted">{hint}</p>
      )}
    </div>
  );
}

const PURPOSE_STYLES: Record<Purpose, { chip: string; dot: string }> = {
  Instruction: { chip: "bg-forest-tint text-forest ring-forest/25", dot: "bg-forest" },
  Practice: { chip: "bg-ember-tint text-ember-dark ring-ember/35", dot: "bg-ember" },
  Assessment: { chip: "bg-sand text-sand-ink ring-sand-ink/25", dot: "bg-sand-ink" },
};

export function PurposeBadge({ purpose }: { purpose: Purpose }) {
  const style = PURPOSE_STYLES[purpose];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none ring-1 ring-inset ${style.chip}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${style.dot}`} />
      {purpose}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-paper px-2.5 py-1 text-xs font-medium leading-none text-ink-soft ring-1 ring-inset ring-line">
      {children}
    </span>
  );
}

export function MockLabel({ children = "Mock AI output" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-tint px-2.5 py-1 align-middle font-sans text-xs font-semibold leading-none tracking-normal text-ember-dark ring-1 ring-inset ring-ember/35">
      <span aria-hidden className="text-[9px] text-ember">◆</span>
      {children}
    </span>
  );
}

const NOTICE_TONES = {
  info: "border-ember/30 border-l-ember bg-ember-tint text-ink-soft",
  error: "border-error/30 border-l-error bg-error-tint text-ink",
} as const;

/** Tinted banner for mock/AI notices, missing-information lists, and errors. */
export function Notice({
  tone = "info",
  title,
  items,
  children,
}: {
  tone?: keyof typeof NOTICE_TONES;
  title?: string;
  items?: string[];
  children?: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`flex gap-3 rounded-2xl border border-l-4 px-4 py-3.5 text-sm leading-relaxed ${NOTICE_TONES[tone]}`}
    >
      <span aria-hidden className={`mt-1.5 size-2 shrink-0 rounded-full ${tone === "error" ? "bg-error" : "bg-ember"}`} />
      <div className="min-w-0 space-y-1">
        {title && <p className={`font-semibold ${tone === "error" ? "text-error" : "text-ember-dark"}`}>{title}</p>}
        {children && <div>{children}</div>}
        {items && items.length > 0 && (
          <ul className="list-disc space-y-0.5 pl-4 marker:text-ember">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Small step label above page titles, e.g. "Step 1 of 3". */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ember-dark">
      <span aria-hidden className="h-0.5 w-5 rounded-full bg-ember" />
      {children}
    </p>
  );
}

const CARD_TONES = {
  paper: "border-line bg-paper shadow-soft",
  sage: "border-sage-deep bg-sage",
  forest: "border-forest/25 bg-forest-tint",
} as const;

export function Card({
  className = "",
  tone = "paper",
  children,
}: {
  className?: string;
  tone?: keyof typeof CARD_TONES;
  children: ReactNode;
}) {
  return <div className={`rounded-2xl border ${CARD_TONES[tone]} ${className}`}>{children}</div>;
}

export function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}
