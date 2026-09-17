import type { ReactNode } from "react";

import { cn } from "@/components/ui";

export const adminInput =
  "w-full rounded-lg border border-white/12 bg-ink-800/80 px-3 py-2.5 text-sm text-white placeholder:text-mist/35 transition focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/15";

export const adminLabel =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-mist/60 mb-1.5";

export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-[0.06em] text-white sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist/65">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
  actions,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl panel p-5 sm:p-6", className)}>
      {title ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold">{title}</h2>
            {description ? <p className="mt-1.5 text-xs text-mist/55">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "gold" | "green" | "amber" | "red";
}) {
  const tones = {
    neutral: "text-white",
    gold: "gold-text",
    green: "text-emerald-300",
    amber: "text-amber-300",
    red: "text-red-300",
  };
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mist/50">{label}</p>
      <p className={cn("mt-2 font-display text-2xl font-bold", tones[tone])}>{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-mist/45">{hint}</p> : null}
    </div>
  );
}

export function StatusTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_review: "border-white/15 bg-white/5 text-mist",
    under_review: "border-sky-400/35 bg-sky-400/10 text-sky-300",
    shortlisted: "border-amber-400/35 bg-amber-400/10 text-amber-300",
    selected: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
    not_selected: "border-red-400/30 bg-red-400/10 text-red-300",
  };
  const labels: Record<string, string> = {
    pending_review: "Pending",
    under_review: "Under review",
    shortlisted: "Shortlisted",
    selected: "Selected",
    not_selected: "Not selected",
  };
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
        map[status] ?? map.pending_review,
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-white/10 pb-3 pr-4 text-[10px] font-bold uppercase tracking-[0.18em] text-mist/50",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-white/6 py-3 pr-4 align-middle text-mist/85", className)}>
      {children}
    </td>
  );
}
