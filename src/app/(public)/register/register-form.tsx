"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

import { Alert, Button, Field, inputClass, labelClass } from "@/components/ui";

type Errors = Record<string, string>;

const SOFTWARE_OPTIONS = [
  "After Effects",
  "Premiere Pro",
  "Vegas Pro",
  "DaVinci Resolve",
  "Final Cut Pro",
  "Alight Motion",
  "CapCut",
  "VN",
  "KineMaster",
  "Node Video",
  "Other",
];

export function RegisterForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ username: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(formData.entries());
    payload.consent = formData.get("consent") === "on";

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        ok: boolean;
        errors?: Errors;
        message?: string;
        registration?: { editingUsername: string };
      };

      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? { form: data.message ?? "Something went wrong. Try again." });
        window.scrollTo({ top: 200, behavior: "smooth" });
        return;
      }

      setDone({ username: data.registration?.editingUsername ?? "" });
      window.scrollTo({ top: 120, behavior: "smooth" });
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl panel p-8 text-center sm:p-12">
        <CheckCircle2 size={44} className="mx-auto text-gold" />
        <h2 className="mt-6 font-display text-2xl font-bold uppercase tracking-[0.08em] text-white">
          Registration submitted successfully
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-mist/75">
          Your audition will now be reviewed by the Clash of Editors organizing team.
        </p>
        {done.username ? (
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/80">
            Registered as {done.username}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/timeline"
            className="rounded-full border border-gold/45 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gold transition hover:bg-gold/10"
          >
            View timeline
          </Link>
          <Link
            href="/rules"
            className="rounded-full border border-white/15 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-gold/40"
          >
            Read the rules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl panel p-6 sm:p-8" noValidate>
      {errors.form ? <Alert tone="error">{errors.form}</Alert> : null}

      <div className="space-y-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
          Required information
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name / display name" htmlFor="displayName" required error={errors.displayName}>
            <input
              id="displayName"
              name="displayName"
              className={inputClass}
              placeholder="How should we address you?"
              autoComplete="name"
              required
            />
          </Field>
          <Field
            label="Editing username"
            htmlFor="editingUsername"
            required
            error={errors.editingUsername}
            hint="The name you are known by as an editor"
          >
            <input
              id="editingUsername"
              name="editingUsername"
              className={inputClass}
              placeholder="e.g. yourtag"
              required
            />
          </Field>
        </div>

        <Field
          label="Gmail"
          htmlFor="email"
          required
          error={errors.email}
          hint="Stored privately — never displayed publicly"
        >
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={inputClass}
            placeholder="you@gmail.com"
            required
          />
        </Field>

        <Field
          label="Edit submission link"
          htmlFor="submissionLink"
          required
          error={errors.submissionLink}
          hint="YouTube, Drive, Instagram or any public link to your audition edit"
        >
          <input
            id="submissionLink"
            name="submissionLink"
            type="url"
            inputMode="url"
            className={inputClass}
            placeholder="https://"
            required
          />
        </Field>
      </div>

      <div className="h-px hairline" />

      <div className="space-y-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-mist/60">
          Optional information
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="YouTube handle" htmlFor="youtubeHandle" error={errors.youtubeHandle}>
            <input
              id="youtubeHandle"
              name="youtubeHandle"
              className={inputClass}
              placeholder="@yourchannel"
            />
          </Field>
          <Field
            label="Instagram username"
            htmlFor="instagramUsername"
            error={errors.instagramUsername}
          >
            <input
              id="instagramUsername"
              name="instagramUsername"
              className={inputClass}
              placeholder="@yourhandle"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Editing software" htmlFor="editingSoftware" error={errors.editingSoftware}>
            <input
              id="editingSoftware"
              name="editingSoftware"
              list="software-options"
              className={inputClass}
              placeholder="After Effects, Alight Motion…"
            />
            <datalist id="software-options">
              {SOFTWARE_OPTIONS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </Field>
          <div>
            <span className={labelClass}>Editing platform</span>
            <select id="platform" name="platform" className={inputClass} defaultValue="">
              <option value="">Prefer not to say</option>
              <option value="pc">PC editor</option>
              <option value="mobile">Mobile editor</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        <Field label="Portfolio link" htmlFor="portfolioLink" error={errors.portfolioLink}>
          <input
            id="portfolioLink"
            name="portfolioLink"
            type="url"
            inputMode="url"
            className={inputClass}
            placeholder="https://"
          />
        </Field>

        <Field
          label="Short introduction"
          htmlFor="introduction"
          error={errors.introduction}
          hint="Tell the organizers about your editing style in a few lines"
        >
          <textarea
            id="introduction"
            name="introduction"
            rows={5}
            className={inputClass}
            placeholder="Your editing background, style and what you want from this competition…"
          />
        </Field>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <label htmlFor="consent" className="flex cursor-pointer items-start gap-3 text-[13px] text-mist/75">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 bg-ink-800 accent-[#a78bfa]"
          />
          <span>
            I confirm the audition is my own original work and I accept the{" "}
            <Link href="/rules" className="text-gold underline-offset-4 hover:underline">
              competition rules
            </Link>
            .
          </span>
        </label>
        {errors.consent ? (
          <p className="mt-2 text-xs font-medium text-red-300">{errors.consent}</p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
        {pending ? "Submitting…" : "Submit registration"}
      </Button>

      <p className="text-center text-xs text-mist/45">
        By submitting you agree that the organizing team may review your audition privately.
      </p>
    </form>
  );
}
