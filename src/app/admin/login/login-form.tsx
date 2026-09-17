"use client";

import { useActionState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";

import { loginAction } from "@/app/admin/actions";
import { initialActionState } from "@/lib/action-state";
import { adminInput, adminLabel } from "@/components/admin/ui";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <div className="rounded-lg border border-red-400/35 bg-red-400/10 px-3 py-2.5 text-xs text-red-200">
          {state.error}
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className={adminLabel}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={adminInput}
          placeholder="organizer@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className={adminLabel}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={adminInput}
          placeholder="••••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#cbb3ff] to-[#7c3aed] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? <LoaderCircle size={14} className="animate-spin" /> : <LogIn size={14} />}
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
