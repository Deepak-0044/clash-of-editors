import type { Metadata } from "next";
import { Camera, CirclePlay, Globe, Mail } from "lucide-react";

import { PageHero } from "@/components/sections";
import { Card, Container, Section, SectionHeading } from "@/components/ui";
import { getSettings } from "@/lib/data";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the Clash of Editors organizing team about registration, auditions, rules or partnership questions.",
  openGraph: { title: "Contact | Clash of Editors" },
};

export default async function ContactPage() {
  const settings = await getSettings();

  const channels = [
    { label: "Email", value: settings.contactEmail, icon: Mail, href: settings.contactEmail ? `mailto:${settings.contactEmail}` : null },
    { label: "Discord", value: settings.contactDiscord, icon: Globe, href: settings.contactDiscord },
    { label: "Instagram", value: settings.contactInstagram, icon: Camera, href: settings.contactInstagram },
    { label: "YouTube", value: settings.contactYoutube, icon: CirclePlay, href: settings.contactYoutube },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the organizing team"
        description="Questions about registration, the audition, the rulebook or the schedule? Send a message and the organizing team will get back to you."
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr]">
            <div>
              <SectionHeading eyebrow="Send a message" title="Official support form" />
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <Card>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold">
                  Direct channels
                </h3>
                <ul className="mt-5 space-y-4">
                  {channels.map((channel) => (
                    <li key={channel.label} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-mist/70">
                        <channel.icon size={14} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist/50">
                          {channel.label}
                        </p>
                        {channel.value && channel.href ? (
                          <a
                            href={channel.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="block truncate text-sm text-white hover:text-gold"
                          >
                            {channel.value}
                          </a>
                        ) : (
                          <p className="text-sm text-mist/45">TBA</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="border-gold/20">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold">
                  Before you write
                </h3>
                <ul className="mt-4 space-y-2 text-[13px] leading-relaxed text-mist/70">
                  <li>· Selection results are never shared before the official announcement.</li>
                  <li>· Broken audition links can be corrected — include your editing username.</li>
                  <li>· The rulebook answers most format questions.</li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
