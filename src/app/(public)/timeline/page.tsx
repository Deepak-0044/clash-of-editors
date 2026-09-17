import type { Metadata } from "next";

import { NotificationWindowCard, PageHero, TimelineList } from "@/components/sections";
import { Alert, Container, Section, SectionHeading } from "@/components/ui";
import { computeNotificationWindow } from "@/lib/competition";
import { getSettings, getTimelineEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "Official Clash of Editors timeline: registration, audition review, Final 16 selection, notification deadline, team formation, competition rounds and final results.",
  openGraph: { title: "Timeline | Clash of Editors" },
};

export default async function TimelinePage() {
  const [settings, events] = await Promise.all([getSettings(), getTimelineEvents()]);
  const notificationWindow = computeNotificationWindow(settings);

  return (
    <>
      <PageHero
        eyebrow="Timeline"
        title="Every phase of the championship"
        description="All dates are configured by the organizing team. Anything that has not been confirmed is displayed as TBA — this platform never invents dates."
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <SectionHeading eyebrow="Official schedule" title="Competition phases" />
              <div className="mt-8">
                {events.length > 0 ? (
                  <TimelineList events={events} notificationWindow={notificationWindow} />
                ) : (
                  <Alert tone="info" title="Timeline not configured">
                    The organizing team has not published timeline events yet.
                  </Alert>
                )}
              </div>
            </div>
            <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <NotificationWindowCard window={notificationWindow} />
              <Alert tone="info" title="How the notification deadline works">
                The countdown to the selection notification starts when the registration period
                closes — not when you personally submit. Deadline = registration closing date +{" "}
                {notificationWindow.windowDays} calendar days.
              </Alert>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
