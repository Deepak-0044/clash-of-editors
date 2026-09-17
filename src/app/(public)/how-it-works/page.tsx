import type { Metadata } from "next";
import { CheckCircle2, CircleAlert } from "lucide-react";

import { NotificationWindowCard, PageHero, RegistrationCta, WorkflowGrid } from "@/components/sections";
import { Card, Container, Section, SectionHeading } from "@/components/ui";
import { WORKFLOW_STEPS, computeNotificationWindow } from "@/lib/competition";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "The full Clash of Editors competition workflow: registration, audition submission, manual review, Final 16 selection, notification, team formation, competition and results.",
  openGraph: { title: "How It Works | Clash of Editors" },
};

const EVALUATION_CRITERIA = [
  {
    title: "Creativity",
    text: "Concept, originality, sync ideas, transitions with intent — how far you push the edit beyond a template.",
  },
  {
    title: "Effort",
    text: "Density of work, complexity of the timeline, and how much care the edit clearly required.",
  },
  {
    title: "Cleanliness",
    text: "Masking, tracking, colour, typography, timing accuracy and general technical execution.",
  },
  {
    title: "Overall edit quality",
    text: "How the edit lands as a complete piece: pacing, impact, consistency and finish.",
  },
];

export default async function HowItWorksPage() {
  const settings = await getSettings();
  const notificationWindow = computeNotificationWindow(settings);

  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From registration to the throne"
        description="Clash of Editors runs on a fixed, transparent workflow. Each stage is controlled manually by the organizing team — there is no automatic scoring or automatic selection anywhere in this competition."
      />

      <Section>
        <Container>
          <SectionHeading eyebrow="The workflow" title="Eight official stages" />
          <div className="mt-10">
            <WorkflowGrid />
          </div>
        </Container>
      </Section>

      <Section className="border-y border-white/6 bg-ink-800/40">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Review criteria"
                title="What reviewers actually look at"
                description="Every audition is scored internally on four criteria. These scores support the discussion — they never decide the outcome by themselves."
              />
              <div className="mt-8 space-y-4">
                {EVALUATION_CRITERIA.map((criterion) => (
                  <Card key={criterion.title}>
                    <h3 className="text-[13px] font-bold uppercase tracking-[0.16em] text-gold">
                      {criterion.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-mist/70">{criterion.text}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-gold/20">
                <h3 className="font-display text-xl font-bold uppercase tracking-[0.08em] text-white">
                  The {notificationWindow.windowDays}-day notification rule
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-mist/70">
                  The countdown starts when the official registration period closes — never
                  separately for each participant. The deadline is calculated as{" "}
                  <span className="text-gold">
                    registration closing date + {notificationWindow.windowDays} calendar days
                  </span>
                  . If the closing date has not been configured, the deadline is shown as TBA.
                </p>
              </Card>
              <NotificationWindowCard window={notificationWindow} />
              <Card>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.16em] text-white">
                  What you can expect
                </h3>
                <ul className="mt-4 space-y-3 text-[13px] leading-relaxed text-mist/70">
                  <li className="flex gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-gold" />
                    A confirmation the moment your registration is stored.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-gold" />
                    A manual review of your audition by the organizing team.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-gold" />
                    Notification of the outcome within the official notification window.
                  </li>
                  <li className="flex gap-3">
                    <CircleAlert size={16} className="mt-0.5 shrink-0 text-amber-300" />
                    Your email address is never displayed publicly anywhere on this site.
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Stage by stage"
            title="What happens in each phase"
            align="center"
          />
          <ol className="mx-auto mt-12 max-w-3xl space-y-4">
            {WORKFLOW_STEPS.map((step, index) => (
              <li key={step.key}>
                <Card className="flex gap-5">
                  <span className="font-display text-2xl font-bold text-gold/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-mist/65">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <RegistrationCta
            open={settings.registrationFormOpen && settings.status === "registration_open"}
          />
        </Container>
      </Section>
    </>
  );
}
