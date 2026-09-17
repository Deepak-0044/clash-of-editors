import type { Metadata } from "next";

import { LeaderCard, LeaderSlot, PageHero } from "@/components/sections";
import { Alert, Container, Section, SectionHeading } from "@/components/ui";
import { getPublishedLeaders, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaders",
  description:
    "Meet the four Clash of Editors leaders: two PC editors and two mobile editors, each building their own roster from the Final 16.",
  openGraph: { title: "Leaders | Clash of Editors" },
};

export default async function LeadersPage() {
  const [settings, leaders] = await Promise.all([getSettings(), getPublishedLeaders()]);

  const pcLeaders = leaders.filter((leader) => leader.platform === "pc" || leader.platform === "both");
  const mobileLeaders = leaders.filter((leader) => leader.platform === "mobile");

  return (
    <>
      <PageHero
        eyebrow="The leaders"
        title="Four leaders. Four editing identities."
        description="Two PC editors and two mobile editors lead the competition. Each leader builds a roster from the Final 16 and guides their team through every round."
      />

      <Section>
        <Container>
          {leaders.length === 0 ? (
            <>
              <Alert tone="info" title="Leaders not announced yet">
                The organizing team has not published the leader line-up. Slots below are
                placeholders — no leader identities are invented by this platform.
              </Alert>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((slot) => (
                  <LeaderSlot key={slot} index={slot} platform={slot <= 2 ? "pc" : "mobile"} />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-16">
              <div>
                <SectionHeading
                  eyebrow="PC division"
                  title="PC editors"
                  description="Leaders competing from desktop editing suites."
                />
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {pcLeaders.length > 0 ? (
                    pcLeaders.map((leader) => <LeaderCard key={leader.id} leader={leader} />)
                  ) : (
                    <>
                      <LeaderSlot index={1} platform="pc" />
                      <LeaderSlot index={2} platform="pc" />
                    </>
                  )}
                </div>
              </div>
              <div>
                <SectionHeading
                  eyebrow="Mobile division"
                  title="Mobile editors"
                  description="Leaders competing entirely from mobile editing apps."
                />
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {mobileLeaders.length > 0 ? (
                    mobileLeaders.map((leader) => <LeaderCard key={leader.id} leader={leader} />)
                  ) : (
                    <>
                      <LeaderSlot index={3} platform="mobile" />
                      <LeaderSlot index={4} platform="mobile" />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="mt-12 text-center text-xs uppercase tracking-[0.2em] text-mist/45">
            {settings.leaderSlots} leader slots · {settings.seasonLabel}
          </p>
        </Container>
      </Section>
    </>
  );
}
