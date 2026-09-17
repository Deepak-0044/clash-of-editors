"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

import { Alert, Button, Field, inputClass } from "@/components/ui";

type Errors = Record<string, string>;

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok: boolean; errors?: Errors; message?: string };

      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? { form: data.message ?? "Something went wrong. Try again." });
        return;
      }
      setSent(true);
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl panel p-8 text-center">
        <CheckCircle2 size={36} className="mx-auto text-gold" />
        <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-[0.1em] text-white">
          Message sent
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-mist/70">
          Your message reached the Clash of Editors organizing team. You will receive a reply at the
          email address you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl panel p-6 sm:p-8" noValidate>
      {errors.form ? <Alert tone="error">{errors.form}</Alert> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={errors.name}>
          <input id="name" name="name" className={inputClass} placeholder="Your name" required />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            className={inputClass}
            placeholder="you@example.com"
            required
          />
        </Field>
      </div>

      <Field label="Subject" htmlFor="subject" required error={errors.subject}>
        <input
          id="subject"
          name="subject"
          className={inputClass}
          placeholder="What is this about?"
          required
        />
      </Field>

      <Field label="Message" htmlFor="message" required error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={6}
          className={inputClass}
          placeholder="Write your message…"
          required
        />
      </Field>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
        {pending ? "Sending" : "Send message"}
      </Button>
    </form>
  );
}
