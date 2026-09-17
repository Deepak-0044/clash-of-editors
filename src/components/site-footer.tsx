import Link from "next/link";
import { Crown, Mail, CirclePlay, Camera, Globe } from "lucide-react";

import type { CompetitionSettings } from "@/db/schema";
import { COMPETITION_STATUS_LABELS } from "@/lib/competition";

const COLUMNS = [
  {
    title: "Competition",
    links: [
      { href: "/about", label: "About" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/timeline", label: "Timeline" },
      { href: "/rules", label: "Rules" },
    ],
  },
  {
    title: "Participants",
    links: [
      { href: "/register", label: "Register" },
      { href: "/leaders", label: "Leaders" },
      { href: "/editors", label: "Editors" },
      { href: "/results", label: "Results" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/rules#review", label: "Review Process" },
      { href: "/admin/login", label: "Organizer Login" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: CompetitionSettings }) {
  const socials = [
    settings.contactEmail
      ? { href: `mailto:${settings.contactEmail}`, label: "Email", icon: Mail }
      : null,
    settings.contactYoutube
      ? { href: settings.contactYoutube, label: "YouTube", icon: CirclePlay }
      : null,
    settings.contactInstagram
      ? { href: settings.contactInstagram, label: "Instagram", icon: Camera }
      : null,
    settings.contactDiscord
      ? { href: settings.contactDiscord, label: "Discord", icon: Globe }
      : null,
  ].filter(Boolean) as { href: string; label: string; icon: typeof Mail }[];

  return (
    <footer className="relative border-t border-white/8 bg-ink-800/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/40 bg-gold/10 text-gold">
                <Crown size={17} />
              </span>
              <span className="font-display text-sm font-bold uppercase tracking-[0.24em] text-white">
                Clash of Editors
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist/65">
              A professional anime and video editing championship. Four leaders, sixteen editors,
              one throne. Every audition is reviewed manually by the organizing team.
            </p>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/80">
              {settings.seasonLabel} · {COMPETITION_STATUS_LABELS[settings.status]}
            </p>
            {socials.length ? (
              <div className="mt-5 flex gap-2">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-mist/70 transition hover:border-gold/40 hover:text-gold"
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
                {column.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-mist/65 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/8 pt-7 text-xs text-mist/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Clash of Editors. All rights reserved.</p>
          <p className="uppercase tracking-[0.22em]">Only the best will claim the throne.</p>
        </div>
      </div>
    </footer>
  );
}
