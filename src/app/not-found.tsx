import Link from "next/link";
import { Crown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(139,92,246,0.12),transparent_70%)]"
        aria-hidden
      />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-gold">
        <Crown size={22} />
      </span>
      <h1 className="relative mt-8 font-display text-5xl font-extrabold uppercase tracking-tight text-white">
        404
      </h1>
      <p className="relative mt-4 max-w-md text-sm leading-relaxed text-mist/70">
        This page is not part of the Clash of Editors championship. Check the navigation and try
        again.
      </p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-[#cbb3ff] to-[#7c3aed] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink"
        >
          Back home
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-white/15 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:border-gold/45 hover:text-gold"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
