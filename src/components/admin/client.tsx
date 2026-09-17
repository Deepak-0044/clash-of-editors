"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/components/ui";

export function SubmitButton({
  children,
  variant = "primary",
  size = "sm",
  confirm,
  className,
}: {
  children: ReactNode;
  variant?: "primary" | "outline" | "danger" | "subtle";
  size?: "xs" | "sm" | "md";
  confirm?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  const variants = {
    primary:
      "bg-gradient-to-r from-[#cbb3ff] to-[#7c3aed] text-ink hover:brightness-110 border border-transparent",
    outline: "border border-gold/40 text-gold hover:bg-gold/10",
    danger: "border border-red-500/40 text-red-300 hover:bg-red-500/10",
    subtle: "border border-white/12 text-mist hover:bg-white/5 hover:text-white",
  };
  const sizes = {
    xs: "px-3 py-1.5 text-[10px]",
    sm: "px-4 py-2 text-[11px]",
    md: "px-5 py-2.5 text-xs",
  };

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold uppercase tracking-[0.14em] transition disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {pending ? <LoaderCircle size={13} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

export function FlashMessage() {
  const params = useSearchParams();
  const router = useRouter();
  const message = params.get("msg");
  const tone = params.get("tone") === "error" ? "error" : "ok";
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));
    if (!message) return;
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace(window.location.pathname);
    }, 6000);
    return () => clearTimeout(timer);
  }, [message, router]);

  if (!visible || !message) return null;

  return (
    <div
      className={cn(
        "mb-6 rounded-xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-red-400/35 bg-red-400/10 text-red-200"
          : "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
      )}
      role="status"
    >
      {message}
    </div>
  );
}

export function Disclosure({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-mist hover:text-white"
      >
        {label}
        <span className="text-gold">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="border-t border-white/8 p-4">{children}</div> : null}
    </div>
  );
}

export function AdminSidebarToggle({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg border border-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist lg:hidden"
      >
        {open ? "Hide menu" : "Menu"}
      </button>
      <div className={cn("lg:block", open ? "block" : "hidden")}>{children}</div>
    </>
  );
}
