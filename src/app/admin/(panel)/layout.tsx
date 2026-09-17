import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Crown, ExternalLink, LogOut } from "lucide-react";

import { AdminNav } from "@/components/admin/nav";
import { FlashMessage } from "@/components/admin/client";
import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { COMPETITION_STATUS_LABELS } from "@/lib/competition";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organizer Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/40 bg-gold/10 text-gold">
              <Crown size={17} />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[12px] font-bold uppercase tracking-[0.24em] text-white">
                Clash of Editors
              </span>
              <span className="mt-1 block text-[9px] uppercase tracking-[0.22em] text-gold/70">
                Organizer dashboard
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist/60 md:inline-flex">
              {COMPETITION_STATUS_LABELS[settings.status]}
            </span>
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-2 rounded-lg border border-white/12 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist/70 transition hover:text-white sm:inline-flex"
            >
              <ExternalLink size={13} />
              Public site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist/70 transition hover:border-red-400/40 hover:text-red-300"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-8 sm:px-8 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <AdminNav role={admin.role} />
            <p className="mt-6 hidden px-3 text-[10px] uppercase tracking-[0.18em] text-mist/35 lg:block">
              Signed in as
              <span className="mt-1 block truncate text-mist/60">{admin.email}</span>
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Suspense fallback={null}>
            <FlashMessage />
          </Suspense>
          {children}
        </main>
      </div>
    </div>
  );
}
