import type { Metadata } from "next";
import { Camera, CirclePlay, Lock, Monitor, Smartphone, Sparkles, Users } from "lucide-react";

import { PageHero } from "@/components/sections";
import { Alert, Badge, Card, Container, EmptyState, Section, SectionHeading } from "@/components/ui";
import { PLATFORM_LABELS } from "@/lib/competition";
import { getPublicEditors, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editors",
  description:
    "The Final 16 of Clash of Editors. Selected editors are published here only after the organizing team officially releases the roster.",
  openGraph: { title: "Editors | Clash of Editors" },
};

export default async function EditorsPage() {
  const settings = await getSettings();
  const editors = await getPublicEditors(settings);

  return (
    <>
      <PageHero
        eyebrow="The final 16"
        title="Selected editors"
        description="The Final 16 roster stays completely private until the organizing team publishes it. Emails, internal scores and reviewer notes are never shown here."
      />

      <Section>
        <Container>
          {!settings.final16Published ? (
            <>
              <Alert tone="warning" title="The Final 16 has not been published">
                Selection results remain confidential while the organizing team reviews auditions.
                Selected editors are notified directly, and this page is updated only after the
                official publication.
              </Alert>
              <div className="mt-10">
                <EmptyState
                  icon={<Lock size={30} />}
                  title="Roster locked"
                  description="Come back after the Final 16 announcement. Until then no participant information is exposed on this page."
                />
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-4">
                {Array.from({ length: settings.editorSlots }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-4 py-3"
                  >
                    <span className="font-display text-sm font-bold text-gold/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist/45">
                      Slot reserved
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : editors.length === 0 ? (
            <EmptyState
              icon={<Users size={30} />}
              title="Roster is being finalised"
              description="The Final 16 has been marked as published, but no editors are listed yet. Check back shortly."
            />
          ) : (
            <>
              <SectionHeading
                eyebrow={`${editors.length} of ${settings.editorSlots} editors`}
                title="Official roster"
                description={
                  settings.teamsPublished
                    ? "Team assignments are live. Each editor competes under their leader."
                    : "Team assignments have not been published yet — leaders and teams will appear here once released."
                }
              />
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {editors.map((editor, index) => (
                  <Card key={editor.id} hover className="p-0">
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-ink-600 to-ink">
                      {editor.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={editor.avatarUrl}
                          alt={editor.username}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-display text-4xl font-bold text-white/10">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="truncate font-display text-base font-bold uppercase tracking-[0.08em] text-white">
                        {editor.username}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {editor.platform ? (
                          <Badge tone="neutral">
                            {editor.platform === "mobile" ? (
                              <Smartphone size={12} />
                            ) : editor.platform === "both" ? (
                              <Sparkles size={12} />
                            ) : (
                              <Monitor size={12} />
                            )}
                            {PLATFORM_LABELS[editor.platform]}
                          </Badge>
                        ) : null}
                        {editor.teamName ? <Badge tone="gold">{editor.teamName}</Badge> : null}
                      </div>
                      {editor.leaderName ? (
                        <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-mist/55">
                          Leader · {editor.leaderName}
                        </p>
                      ) : null}
                      <div className="mt-4 flex gap-2">
                        {editor.youtubeHandle ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-mist/60">
                            <CirclePlay size={13} />
                          </span>
                        ) : null}
                        {editor.instagramUsername ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-mist/60">
                            <Camera size={13} />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
