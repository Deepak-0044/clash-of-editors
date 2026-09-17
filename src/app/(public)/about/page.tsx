import type { Metadata } from "next";
import { Crown, Gauge, Layers, ShieldCheck, Target, Users } from "lucide-react";

import { PageHero, RegistrationCta } from "@/components/sections";
import { Card, Container, Section, SectionHeading, StatBlock } from "@/components/ui";
import { getSettings } from "@/lib/data";
import { COMPETITION_STATUS_LABELS } from "@/lib/competition";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Clash of Editors is a professional anime and video editing championship built on manual review, fair judging and a transparent competition structure.",
  openGraph: { title: "About | Clash of Editors" },
};

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Fair manual review",
    text: "Every audition is opened, watched and scored by a human reviewer. Internal scores are reference only — organizers make the final call.",
  },
  {
    icon: Target,
    title: "One audition, full focus",
    text: "A single audition edit per editor keeps the competition focused on quality instead of volume.",
  },
  {
    icon: Users,
    title: "Four leaders, four identities",
    text: "Two PC editors and two mobile editors each build a roster that matches their creative direction.",
  },
  {
    icon: Layers,
    title: "Structured progression",
    text: "Registration, review, selection, notification, team formation, competition and results — nothing is improvised.",
  },
  {
    icon: Gauge,
    title: "Privacy first",
    text: "Gmail addresses, reviewer notes and internal scores never leave the organizer dashboard.",
  },
  {
    icon: Crown,
    title: "One throne",
    text: "Sixteen editors enter the roster. Only one team walks away with the championship.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="About"
        title="The championship for editors who take the craft seriously"
        description={
          settings.aboutIntro ||
          "Clash of Editors is a professional anime and video editing competition. Editors register, submit a single audition edit and are reviewed manually by the organizing team on creativity, effort, cleanliness and overall edit quality."
        }
      />

      <Section>
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatBlock value={settings.leaderSlots} label="Leaders" hint="2 PC · 2 Mobile" />
            <StatBlock value={settings.editorSlots} label="Editors" hint="Selected manually" />
            <StatBlock
              value={settings.auditionCount}
              label="Audition"
              hint="Reviewed by organizers"
            />
          </div>
        </Container>
      </Section>

      <Section className="border-y border-white/6 bg-ink-800/40">
        <Container>
          <SectionHeading
            eyebrow="What we stand for"
            title="Six principles that shape every decision"
            align="center"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar) => (
              <Card key={pillar.title} hover>
                <pillar.icon size={20} className="text-gold" />
                <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.16em] text-white">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed text-mist/65">{pillar.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Format"
                title="How the roster is built"
                description="Sixteen editors are selected from the audition pool. Once the Final 16 is published, the four leaders and the organizing team manually divide them into balanced teams."
              />
              <ul className="mt-8 space-y-3 text-[14px] leading-relaxed text-mist/70">
                <li>· Editing style and creative compatibility are considered during team formation.</li>
                <li>· Platform balance between PC and mobile editors is respected.</li>
                <li>· Team assignments are never automatic — a human builds every roster.</li>
                <li>· Team rosters stay private until the organizing team publishes them.</li>
              </ul>
            </div>
            <Card className="self-start border-gold/20">
              <h3 className="font-display text-xl font-bold uppercase tracking-[0.1em] text-white">
                Current state
              </h3>
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-white/6 pb-3">
                  <dt className="text-mist/60">Season</dt>
                  <dd className="font-semibold text-white">{settings.seasonLabel}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/6 pb-3">
                  <dt className="text-mist/60">Status</dt>
                  <dd className="font-semibold text-gold">
                    {COMPETITION_STATUS_LABELS[settings.status]}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/6 pb-3">
                  <dt className="text-mist/60">Final 16</dt>
                  <dd className="font-semibold text-white">
                    {settings.final16Published ? "Published" : "Private"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-mist/60">Teams</dt>
                  <dd className="font-semibold text-white">
                    {settings.teamsPublished ? "Published" : "Pending"}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
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
