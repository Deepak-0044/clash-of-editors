import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown } from "lucide-react";

import { adminCount, getCurrentAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organizer Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin/dashboard");

  const existing = await adminCount();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(139,92,246,0.14),transparent_70%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-gold">
            <Crown size={22} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-[0.14em] text-white">
            Organizer access
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-mist/50">
            Clash of Editors control room
          </p>
        </div>

        <div className="rounded-2xl panel p-7">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-mist/45">
          {existing === 0 ? (
            <>
              No organizer account exists yet.{" "}
              <Link href="/admin/setup" className="text-gold hover:underline">
                Create the first owner account
              </Link>
              .
            </>
          ) : (
            <>
              Access is restricted to the Clash of Editors organizing team.{" "}
              <Link href="/" className="text-gold hover:underline">
                Back to site
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
