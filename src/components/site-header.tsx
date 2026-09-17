"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Crown } from "lucide-react";

import { cn } from "@/components/ui";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/leaders", label: "Leaders" },
  { href: "/editors", label: "Editors" },
  { href: "/timeline", label: "Timeline" },
  { href: "/rules", label: "Rules" },
  { href: "/results", label: "Results" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ statusLabel }: { statusLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/8 bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/40 bg-gold/10 text-gold transition group-hover:bg-gold/20">
            <Crown size={17} strokeWidth={2} />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[13px] font-bold uppercase tracking-[0.28em] text-white">
              Clash of Editors
            </span>
            <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.26em] text-gold/70">
              Only the best will claim the throne
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition",
                  active ? "text-gold" : "text-mist/70 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist/70 xl:inline-flex">
            <span className="status-dot h-1.5 w-1.5 rounded-full bg-gold" />
            {statusLabel}
          </span>
          <Link
            href="/register"
            className="hidden rounded-full bg-gradient-to-r from-[#cbb3ff] via-[#a78bfa] to-[#7c3aed] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink transition hover:brightness-110 sm:inline-flex"
          >
            Register
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 text-white lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/8 bg-ink/97 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-5 py-4 sm:px-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition",
                  pathname === link.href
                    ? "bg-gold/10 text-gold"
                    : "text-mist/80 hover:bg-white/5 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/register"
              className="mt-2 rounded-lg bg-gradient-to-r from-[#cbb3ff] to-[#7c3aed] px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-ink"
            >
              Register Now
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
