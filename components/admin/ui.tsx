import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export const adminInputClass =
  "mt-1.5 w-full rounded-xl border-2 border-ink-900 bg-white px-3 py-2.5 text-sm font-semibold text-ink-900 placeholder:font-medium placeholder:text-ink-500";

type Tone = "brand" | "sun" | "mint" | "coral" | "neutral" | "grape";

const toneClass: Record<Tone, string> = {
  brand: "border-brand-600 bg-brand-50 text-brand-800",
  sun: "border-sun-600 bg-sun-50 text-ink-900",
  mint: "border-mint-600 bg-mint-50 text-mint-700",
  coral: "border-coral-600 bg-coral-50 text-coral-700",
  neutral: "border-ink-500 bg-white text-ink-700",
  grape: "border-grape-600 bg-grape-50 text-grape-700",
};

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${toneClass[tone]}`}
    >
      {label}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">
          Panel admin
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-600">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`gd-card p-5 sm:p-6 ${className}`}>{children}</section>;
}

export function StatCard({
  label,
  value,
  note,
  href,
  tone = "neutral",
}: {
  label: string;
  value: number;
  note: string;
  href: string;
  tone?: Tone;
}) {
  return (
    <Link
      href={href}
      className="gd-card gd-lift flex flex-col justify-between p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-extrabold text-ink-700">{label}</p>
        <Badge label="Lihat" tone={tone} />
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-semibold leading-relaxed text-ink-500">
        {note}
      </p>
    </Link>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-ink-500/50 bg-mist px-5 py-10 text-center">
      <p className="text-base font-extrabold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm font-semibold leading-relaxed text-ink-600">
        {description}
      </p>
    </div>
  );
}

export function ErrorNote({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border-2 border-coral-600 bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-700 sm:flex-row sm:items-center sm:justify-between"
    >
      <span>{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="self-start rounded-lg border-2 border-coral-600 px-3 py-1.5 text-xs font-extrabold text-coral-700 hover:bg-white sm:self-auto"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}

export function SuccessNote({ message }: { message: string }) {
  return (
    <p
      aria-live="polite"
      className="rounded-xl border-2 border-mint-600 bg-mint-50 px-4 py-3 text-sm font-semibold text-mint-700"
    >
      {message}
    </p>
  );
}

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-ink-900 bg-white px-4 py-5 text-sm font-extrabold text-ink-700">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      {label}
    </div>
  );
}

export function TextField({
  label,
  hint,
  className = "",
  ...props
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold">{label}</span>
      <input {...props} className={`${adminInputClass} ${className}`} />
      {hint ? (
        <span className="mt-1 block text-xs font-semibold text-ink-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  className = "",
  ...props
}: {
  label: string;
  hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold">{label}</span>
      <textarea
        {...props}
        className={`${adminInputClass} min-h-24 ${className}`}
      />
      {hint ? (
        <span className="mt-1 block text-xs font-semibold text-ink-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function SelectField({
  label,
  options,
  className = "",
  ...props
}: {
  label: string;
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold">{label}</span>
      <select {...props} className={`${adminInputClass} ${className}`}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const variants = {
  primary: "gd-btn-primary",
  sun: "gd-btn-sun",
  dark: "gd-btn-dark",
  outline: "bg-white text-ink-900 hover:bg-mist",
  danger: "bg-coral-600 text-white hover:bg-coral-700",
};

export function AdminButton({
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: {
  variant?: keyof typeof variants;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`gd-btn min-h-10 rounded-xl px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}

export function FilterTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-extrabold transition ${
              active
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-900 bg-white text-ink-700 hover:bg-mist"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
