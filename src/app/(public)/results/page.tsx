import type { Metadata } from "next";
import { Trophy } from "lucide-react";

import { PageHero } from "@/components/sections";
import { Badge, Card, Container, EmptyState, Section, SectionHeading } from "@/components/ui";
import { formatDate } from "@/lib/competition";
import { getPublishedResults, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Results",
  description:
    "Official Clash of Editors results. Round results, final standings and winner announcements are published manually by the organizing team.",
  openGraph: { title: "Results | Clash of Editors" },
};

export default async function ResultsPage() {
  const settings = await getSettings();
  const results = settings.resultsPublished ? await getPublishedResults() : [];

  return (
    <>
      <PageHero
        eyebrow="Results"
        title="Official standings"
        description="Every result on this page is published manually by the organizing team. Nothing here is generated automatically."
      />

      <Section>
        <Container>
          {!settings.resultsPublished || results.length === 0 ? (
            <EmptyState
              icon={<Trophy size={30} />}
              title="No results yet"
              description={settings.resultsPlaceholderText || "Results will be announced soon."}
            />
          ) : (
            <>
              <SectionHeading
                eyebrow={`${results.length} published entr${results.length === 1 ? "y" : "ies"}`}
                title="Rounds & final standings"
              />
              <div className="mt-10 space-y-5">
                {results.map((result) => (
                  <Card key={result.id} hover>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge tone="gold">{result.roundName}</Badge>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mist/55">
                        {formatDate(result.publishedAt ?? result.createdAt)}
                      </span>
                    </div>
                    <h2 className="mt-4 font-display text-xl font-bold uppercase tracking-[0.06em] text-white">
                      {result.title}
                    </h2>
                    {result.placement ? (
                      <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-gold">
                        {result.placement}
                      </p>
                    ) : null}
                    {result.summary ? (
                      <p className="mt-4 text-[14px] leading-relaxed text-mist/75">
                        {result.summary}
                      </p>
                    ) : null}
                    {result.body ? (
                      <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-mist/60">
                        {result.body}
                      </p>
                    ) : null}
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
