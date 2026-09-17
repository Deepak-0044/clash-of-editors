import Link from "next/link";
import { ArrowRight, ChevronRight, Megaphone, Scale, ShieldCheck, Sparkles } from "lucide-react";

import {
  AnnouncementList,
  LeaderCard,
  LeaderSlot,
  NotificationWindowCard,
  RegistrationCta,
  TimelineList,
  WorkflowGrid,
} from "@/components/sections";

import {
  Badge,
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
  StatBlock,
  StatusPill,
} from "@/components/ui";

import {
  COMPETITION_STATUS_LABELS,
  computeNotificationWindow,
  formatDate,
} from "@/lib/competition";

import {
  getPublishedAnnouncements,
  getPublishedLeaders,
  getRuleSections,
  getSettings,
  getTimelineEvents,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();

  const [leaders, timeline, announcements, rules] = await Promise.all([
    getPublishedLeaders(),
    getTimelineEvents(),
    getPublishedAnnouncements(4),
    getRuleSections(),
  ]);

  const notificationWindow = computeNotificationWindow(settings);

  const registrationOpen =
    settings.registrationFormOpen &&
    settings.status === "registration_open";

  return (
    <>
      {/* ------------------------------- HERO -------------------------------- */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background/80 to-primary/10">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,12,0.97)_5%,rgba(4,6,12,0.72)_45%,rgba(4,6,12,0.55)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink to-transparent" />
        </div>

        <Container className="relative flex min-h-[640px] flex-col justify-center py-24 sm:min-h-[760px]">
          <div className="max-w-3xl">
            <div className="animate-rise">
              <StatusPill
                label={COMPETITION_STATUS_LABELS[settings.status]}
              />
            </div>

            <h1 className="animate-rise delay-1 mt-8 font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-[86px]">
              Clash of Editors
            </h1>

            <p className="animate-rise delay-2 mt-6 text-xl font-semibold text-white sm:text-2xl">
              Only the best will claim the throne.
            </p>

            <p className="animate-rise delay-3 mt-7 max-w-xl text-[15px] leading-relaxed text-mist/80 sm:text-base">
              A professional anime and video editing competition where
              creativity, technical execution and editing excellence compete
              for the throne. Four leaders. Sixteen editors. One audition that
              decides everything.
            </p>

            <div className="animate-rise delay-4 mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/register" size="lg">
                Register Now
                <ArrowRight size={16} />
              </ButtonLink>

              <ButtonLink
                href="/how-it-works"
                variant="outline"
                size="lg"
              >
                How It Works
              </ButtonLink>
            </div>

            <div className="animate-fade delay-4 mt-12 flex flex-wrap gap-x-8 gap-y-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-mist/55">
              <span>{settings.seasonLabel}</span>

              <span>
                Registration closes ·{" "}
                {formatDate(settings.registrationClosesAt)}
              </span>

              <span>
                Notification ·{" "}
                {formatDate(notificationWindow.notificationDeadline)}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------- STATS -------------------------------- */}
      <Section className="pt-16 sm:pt-20">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatBlock
              value={settings.leaderSlots}
              label="Leaders"
              hint="2 PC · 2 Mobile"
            />

            <StatBlock
              value={settings.editorSlots}
              label="Editors"
              hint="Final roster size"
            />

            <StatBlock
              value={settings.auditionCount}
              label="Audition"
              hint="Per editor, manually reviewed"
            />
          </div>
        </Container>
      </Section>

      {/* ------------------------------- STATUS ------------------------------- */}
      <Section className="pt-0">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="flex flex-col justify-between border-white/8">
              <div>
                <Eyebrow>Competition status</Eyebrow>

                <h2 className="mt-5 font-display text-3xl font-bold uppercase leading-tight text-white">
                  {COMPETITION_STATUS_LABELS[settings.status]}
                </h2>

                <p className="mt-4 text-[14px] leading-relaxed text-mist/70">
                  The organizing team controls every stage of the competition
                  manually. This status is updated from the organizer dashboard
                  and always reflects the real state of the championship.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                <Badge tone={registrationOpen ? "green" : "neutral"}>
                  {registrationOpen ? "Form open" : "Form closed"}
                </Badge>

                <Badge
                  tone={settings.final16Published ? "gold" : "neutral"}
                >
                  Final 16{" "}
                  {settings.final16Published ? "published" : "private"}
                </Badge>

                <Badge tone={settings.teamsPublished ? "gold" : "neutral"}>
                  Teams {settings.teamsPublished ? "published" : "pending"}
                </Badge>
              </div>
            </Card>

            <NotificationWindowCard window={notificationWindow} />
          </div>
        </Container>
      </Section>

      {/* -------------------------------- ABOUT ------------------------------- */}
      <Section
        id="about"
        className="border-y border-white/6 bg-ink-800/40"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <SectionHeading
                eyebrow="About the competition"
                title="A championship built on craft, not luck"
                description={
                  settings.aboutIntro ||
                  "Clash of Editors brings anime and video editors into a structured, fairly judged championship. Editors register, submit a single audition edit, and every entry is reviewed manually by the organizing team on creativity, effort, cleanliness and overall quality."
                }
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Manual review only",
                    text: "No algorithm decides anything. Organizers review each audition and make every selection call.",
                  },
                  {
                    icon: Sparkles,
                    title: "PC and mobile equal",
                    text: "Two PC leaders and two mobile leaders. Your platform never limits your ceiling.",
                  },
                  {
                    icon: Scale,
                    title: "Private by default",
                    text: "Emails, internal scores and reviewer notes are never exposed publicly.",
                  },
                  {
                    icon: Megaphone,
                    title: "Clear communication",
                    text: "Every stage, date and result is published by the organizing team — never invented.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"
                  >
                    <item.icon size={18} className="text-gold" />

                    <h3 className="mt-3 text-[13px] font-bold uppercase tracking-[0.14em] text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-[13px] leading-relaxed text-mist/65">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="self-start">
              <Eyebrow>The journey</Eyebrow>

              <ol className="mt-6 space-y-4">
                {[
                  "Registration",
                  "Audition submission",
                  "Audition review",
                  "Final 16 selection",
                  "Selection notification",
                  "Leader team formation",
                  "Competition",
                  "Results",
                ].map((step, index) => (
                  <li
                    key={step}
                    className="flex items-center gap-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/5 font-display text-[11px] font-bold text-gold">
                      {index + 1}
                    </span>

                    <span className="text-sm font-semibold uppercase tracking-[0.12em] text-mist/85">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>

              <Link
                href="/how-it-works"
                className="mt-7 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold hover:text-gold-bright"
              >
                Full process
                <ChevronRight size={14} />
              </Link>
            </Card>
          </div>
        </Container>
      </Section>

      {/* ----------------------------- HOW IT WORKS --------------------------- */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Eight stages to the throne"
            description="From your first submission to the final verdict, every stage is handled manually by the organizing team."
            align="center"
          />

          <div className="mt-12">
            <WorkflowGrid />
          </div>
        </Container>
      </Section>

      {/* -------------------------------- LEADERS ----------------------------- */}
      <Section className="border-y border-white/6 bg-ink-800/40">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="The four leaders"
              title="Two PC editors. Two mobile editors."
              description="Each leader brings a distinct editing identity and builds their own roster from the Final 16."
            />

            <ButtonLink
              href="/leaders"
              variant="outline"
              size="sm"
            >
              All leaders
            </ButtonLink>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {leaders.length > 0
              ? leaders
                  .slice(0, 4)
                  .map((leader) => (
                    <LeaderCard
                      key={leader.id}
                      leader={leader}
                    />
                  ))
              : [1, 2, 3, 4].map((slot) => (
                  <LeaderSlot
                    key={slot}
                    index={slot}
                    platform={slot <= 2 ? "pc" : "mobile"}
                  />
                ))}
          </div>
        </Container>
      </Section>

      {/* -------------------------------- TIMELINE ---------------------------- */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeading
                eyebrow="Timeline"
                title="Every date, officially confirmed"
                description="Dates are published by the organizing team. Anything not confirmed yet is shown as TBA — we never invent dates."
              />

              <div className="mt-8">
                <ButtonLink
                  href="/timeline"
                  variant="outline"
                  size="sm"
                >
                  Full timeline
                </ButtonLink>
              </div>
            </div>

            <TimelineList
              events={timeline.slice(0, 5)}
              notificationWindow={notificationWindow}
            />
          </div>
        </Container>
      </Section>

      {/* --------------------------------- RULES ------------------------------ */}
      <Section className="border-y border-white/6 bg-ink-800/40">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Rules preview"
              title="Know the standard before you enter"
              description="The complete rulebook is maintained by the organizing team and updated whenever the format changes."
            />

            <ButtonLink
              href="/rules"
              variant="outline"
              size="sm"
            >
              Full rulebook
            </ButtonLink>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {rules.slice(0, 6).map((rule) => (
              <Card key={rule.id} hover>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
                  {rule.title}
                </h3>

                <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-mist/65">
                  {rule.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ----------------------------- ANNOUNCEMENTS -------------------------- */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Announcements"
            title="Latest from the organizing team"
            description="Official updates only. Nothing here is auto-generated."
          />

          <div className="mt-10">
            {announcements.length > 0 ? (
              <AnnouncementList items={announcements} />
            ) : (
              <Card className="border-dashed">
                <p className="text-sm text-mist/65">
                  No announcements have been published yet. Official updates
                  from the organizing team will appear here.
                </p>
              </Card>
            )}
          </div>
        </Container>
      </Section>

      {/* ---------------------------------- CTA ------------------------------- */}
      <Section className="pt-0">
        <Container>
          <RegistrationCta open={registrationOpen} />
        </Container>
      </Section>
    </>
  );
}