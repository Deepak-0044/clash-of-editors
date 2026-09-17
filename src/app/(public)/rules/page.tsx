import type { Metadata } from "next";

import { PageHero, RegistrationCta } from "@/components/sections";
import { Alert, Card, Container, Section } from "@/components/ui";
import { getRuleSections, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rules",
  description:
    "Official Clash of Editors rulebook: eligibility, registration, audition submission, editing requirements, review, selection, team formation, conduct and disqualification.",
  openGraph: { title: "Rules | Clash of Editors" },
};

export default async function RulesPage() {
  const [settings, rules] = await Promise.all([getSettings(), getRuleSections()]);

  return (
    <>
      <PageHero
        eyebrow="Rulebook"
        title="Competition rules"
        description="These rules are maintained by the organizing team. Sections marked as editable are placeholders until the organizers publish the final wording."
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.32fr_0.68fr]">
            <nav className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
                Sections
              </p>
              <ul className="mt-5 space-y-2">
                {rules.map((rule) => (
                  <li key={rule.id}>
                    <a
                      href={`#rule-${rule.id}`}
                      className="block rounded-lg px-3 py-2 text-[13px] text-mist/65 transition hover:bg-white/5 hover:text-white"
                    >
                      {rule.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-5">
              {rules.length === 0 ? (
                <Alert tone="info" title="Rules not published yet">
                  The organizing team has not published the rulebook.
                </Alert>
              ) : (
                rules.map((rule, index) => (
                  <Card key={rule.id} id={`rule-${rule.id}`} className="scroll-mt-28">
                    <div className="flex items-start gap-4">
                      <span className="font-display text-xl font-bold text-gold/35">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h2
                          id={index === 5 ? "review" : undefined}
                          className="text-base font-bold uppercase tracking-[0.14em] text-white"
                        >
                          {rule.title}
                        </h2>
                        <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-mist/70">
                          {rule.body}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
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
