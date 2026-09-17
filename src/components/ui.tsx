import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* --------------------------------- layout -------------------------------- */

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative py-20 sm:py-24", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-gold">
      <span className="h-px w-8 bg-gold/60" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-[15px] leading-relaxed text-mist/80 text-balance">{description}</p>
      ) : null}
    </div>
  );
}

/* --------------------------------- buttons -------------------------------- */

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "subtle";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.16em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#cbb3ff] via-[#a78bfa] to-[#7c3aed] text-ink shadow-[0_10px_40px_-12px_rgba(139,92,246,0.7)] hover:shadow-[0_14px_50px_-10px_rgba(139,92,246,0.85)] hover:brightness-110",
  outline:
    "border border-gold/45 text-gold hover:border-gold hover:bg-gold/10 hover:text-gold-bright",
  ghost: "text-mist hover:text-white hover:bg-white/5",
  danger: "border border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200",
  subtle: "bg-white/7 text-white hover:bg-white/12 border border-white/10",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-6 py-3 text-xs",
  lg: "px-8 py-4 text-[13px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size]);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={cn(buttonClass(variant, size), className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  target,
  rel,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(buttonClass(variant, size), className)}
    >
      {children}
    </Link>
  );
}

/* ---------------------------------- cards --------------------------------- */

export function Card({
  children,
  className,
  hover = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "relative overflow-hidden rounded-2xl panel p-6",
        hover &&
          "transition-all duration-500 hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_30px_60px_-40px_rgba(139,92,246,0.6)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "gold",
  className,
}: {
  children: ReactNode;
  tone?: "gold" | "neutral" | "green" | "amber" | "red" | "blue";
  className?: string;
}) {
  const tones: Record<string, string> = {
    gold: "border-gold/40 bg-gold/10 text-gold-bright",
    neutral: "border-white/12 bg-white/5 text-mist",
    green: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/35 bg-amber-400/10 text-amber-300",
    red: "border-red-400/35 bg-red-400/10 text-red-300",
    blue: "border-sky-400/35 bg-sky-400/10 text-sky-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-ink-700/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-bright backdrop-blur">
      <span className="status-dot h-2 w-2 rounded-full bg-gold" />
      {label}
    </span>
  );
}

export function StatBlock({
  value,
  label,
  hint,
}: {
  value: string | number;
  label: string;
  hint?: string;
}) {
  return (
    <div className="relative rounded-2xl panel px-6 py-7 text-center">
      <div className="gold-text text-4xl font-bold sm:text-5xl">{value}</div>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-mist/70">
        {label}
      </div>
      {hint ? <p className="mt-2 text-xs text-mist/55">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-14 text-center">
      {icon ? <div className="mb-4 flex justify-center text-gold/70">{icon}</div> : null}
      <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mist/70">{description}</p>
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
}) {
  const tones = {
    info: "border-sky-400/30 bg-sky-400/[0.07] text-sky-100",
    success: "border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-100",
    warning: "border-amber-400/30 bg-amber-400/[0.07] text-amber-100",
    error: "border-red-400/30 bg-red-400/[0.07] text-red-100",
  };
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone])}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={cn(title && "mt-1", "leading-relaxed opacity-90")}>{children}</div>
    </div>
  );
}

/* ---------------------------------- forms --------------------------------- */

export const inputClass =
  "w-full rounded-xl border border-white/12 bg-ink-800/80 px-4 py-3 text-[15px] text-white placeholder:text-mist/35 transition focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20";

export const labelClass =
  "block text-[11px] font-semibold uppercase tracking-[0.2em] text-mist/75 mb-2";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {required ? <span className="ml-1 text-gold">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-mist/50">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-300">{error}</p> : null}
    </div>
  );
}
