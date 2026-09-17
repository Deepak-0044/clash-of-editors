import type { Metadata } from "next";
import { Clock, Lock, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/sections";
import { Alert, Card, Container, Section } from "@/components/ui";
import { COMPETITION_STATUS_LABELS, computeNotificationWindow, formatDate } from "@/lib/competition";
import { getSettings } from "@/lib/data";
import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register for Clash of Editors. Submit your details and audition edit link — every entry is reviewed manually by the organizing team.",
  openGraph: { title: "Register | Clash of Editors" },
};

export default async function RegisterPage() {
  const settings = await getSettings();
  const notificationWindow = computeNotificationWindow(settings);
  const open =
    settings.registrationFormOpen &&
    (settings.status === "registration_open" || settings.status === "registration_closed"
      ? settings.status === "registration_open"
      : false);

  return (
    <>
      <PageHero
        eyebrow="Registration"
        title="Enter the clash"
        description="Fill in your details and drop your audition edit link. Your submission goes straight to the organizing team for manual review."
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.62fr]">
            <div>
              {open ? (
                <RegisterForm />
              ) : (
                <Card className="border-amber-400/25">
                  <Alert tone="warning" title="Registration is currently closed">
                    The registration form is not accepting entries right now. Current status:{" "}
                    {COMPETITION_STATUS_LABELS[settings.status]}. Follow the announcements on the
                    homepage for the next opening.
                  </Alert>
                  <p className="mt-5 text-sm leading-relaxed text-mist/65">
                    If you already registered, your audition stays in the review queue. Selected
                    editors are notified within the official notification window.
                  </p>
                </Card>
              )}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <Card className="border-gold/20">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold">
                  Key dates
                </h3>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-white/6 pb-3">
                    <dt className="text-mist/60">Registration opens</dt>
                    <dd className="font-semibold text-white">
                      {formatDate(settings.registrationOpensAt)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-white/6 pb-3">
                    <dt className="text-mist/60">Registration closes</dt>
                    <dd className="font-semibold text-white">
                      {formatDate(settings.registrationClosesAt)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-mist/60">Notification by</dt>
                    <dd className="font-semibold gold-text">
                      {formatDate(notificationWindow.notificationDeadline)}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold">
                  Submission checklist
                </h3>
                <ul className="mt-4 space-y-3 text-[13px] leading-relaxed text-mist/70">
                  <li className="flex gap-3">
                    <ShieldCheck size={15} className="mt-0.5 shrink-0 text-gold" />
                    Your audition link must be public — no private or expired uploads.
                  </li>
                  <li className="flex gap-3">
                    <ShieldCheck size={15} className="mt-0.5 shrink-0 text-gold" />
                    One registration per editor. Duplicate emails or usernames are rejected.
                  </li>
                  <li className="flex gap-3">
                    <Clock size={15} className="mt-0.5 shrink-0 text-gold" />
                    Submit before the closing date — late entries are not reviewed.
                  </li>
                  <li className="flex gap-3">
                    <Lock size={15} className="mt-0.5 shrink-0 text-gold" />
                    Your email is stored privately and never displayed publicly.
                  </li>
                </ul>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
