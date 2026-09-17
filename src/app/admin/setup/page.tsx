import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { adminCount } from "@/lib/auth";
import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organizer Setup",
  robots: { index: false, follow: false },
};

export default async function AdminSetupPage() {
  const existing = await adminCount();
  const locked = existing > 0;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(139,92,246,0.12),transparent_70%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-gold">
            <ShieldCheck size={22} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-[0.12em] text-white">
            First-run setup
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mist/60">
            Create the owner account for the Clash of Editors organizer dashboard. No password is
            ever hardcoded — you choose it here and it is stored as a salted scrypt hash.
          </p>
        </div>

        <div className="rounded-2xl panel p-7">
          {locked ? (
            <div className="rounded-lg border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-xs text-amber-200">
              An organizer account already exists. Creating an additional owner account requires the
              <code className="mx-1 rounded bg-black/30 px-1">ADMIN_SETUP_TOKEN</code>
              environment variable.
            </div>
          ) : null}
          <div className={locked ? "mt-5" : ""}>
            <SetupForm requireToken={locked} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-mist/45">
          Already have an account?{" "}
          <Link href="/admin/login" className="text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
