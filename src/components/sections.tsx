import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Camera,
  CirclePlay,
  Crown,
  Globe,
  Monitor,
  Smartphone,
  Sparkles,
} from "lucide-react";

import type { Announcement, Leader, TimelineEvent } from "@/db/schema";
import {
  PLATFORM_LABELS,
  WORKFLOW_STEPS,
  formatDate,
  formatDateTime,
  type NotificationWindow,
} from "@/lib/competition";
import { Badge, Card, Container, Eyebrow, cn } from "@/components/ui";

/* ------------------------------- page hero -------------------------------- */

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/6 py-20 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_20%_0%,rgba(139,92,246,0.12),transparent_65%)]"
        aria-hidden
      />
      <Container className="relative">
        <div className="animate-rise">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist/75">{description}</p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------ workflow grid ------------------------------ */

export function WorkflowGrid({ compact = false }: { compact?: boolean }) {
  const steps = compact ? WORKFLOW_STEPS.slice(0, 8) : WORKFLOW_STEPS;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <div
          key={step.key}
          className="group relative overflow-hidden rounded-2xl panel p-6 transition duration-500 hover:border-gold/35"
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-3xl font-bold text-white/10 transition group-hover:text-gold/25">
              {String(index + 1).padStart(2, "0")}
            </span>
            {index < steps.length - 1 ? (
              <ArrowRight size={16} className="text-gold/40" />
            ) : (
              <Crown size={16} className="text-gold/60" />
            )}
          </div>
          <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-white">
            {step.title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-mist/65">{step.description}</p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- leaders --------------------------------- */

function PlatformIcon({ platform }: { platform: Leader["platform"] }) {
  if (platform === "mobile") return <Smartphone size={14} />;
  if (platform === "both") return <Sparkles size={14} />;
  return <Monitor size={14} />;
}

export function LeaderCard({ leader }: { leader: Leader }) {
  const socials = [
    leader.youtubeUrl ? { href: leader.youtubeUrl, icon: CirclePlay, label: "YouTube" } : null,
    leader.instagramUrl ? { href: leader.instagramUrl, icon: Camera, label: "Instagram" } : null,
    leader.xUrl ? { href: leader.xUrl, icon: Globe, label: "Profile" } : null,
  ].filter(Boolean) as { href: string; icon: typeof Globe; label: string }[];

  return (
    <Card hover className="group flex flex-col p-0">
      <div className="relative aspect-4/5 w-full overflow-hidden bg-gradient-to-br from-ink-600 to-ink">
        {leader.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={leader.imageUrl}
            alt={leader.username}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Crown size={46} className="text-gold/20" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
        <div className="absolute left-4 top-4">
          <Badge tone="gold">
            <PlatformIcon platform={leader.platform} />
            {PLATFORM_LABELS[leader.platform]}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold uppercase tracking-[0.1em] text-white">
          {leader.username}
        </h3>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/80">
          {leader.editingStyle || "Editing style: TBA"}
        </p>
        <p className="mt-4 flex-1 text-[13px] leading-relaxed text-mist/65">
          {leader.biography || "Biography will be published by the organizing team."}
        </p>
        {socials.length ? (
          <div className="mt-5 flex gap-2">
            {socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.label}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-mist/70 transition hover:border-gold/40 hover:text-gold"
              >
                <social.icon size={14} />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function LeaderSlot({ index, platform }: { index: number; platform: "pc" | "mobile" }) {
  return (
    <div className="flex flex-col rounded-2xl border border-dashed border-white/12 bg-white/[0.015] p-6">
      <div className="flex aspect-4/5 items-center justify-center rounded-xl border border-white/6 bg-ink-700/40">
        <Crown size={38} className="text-gold/15" />
      </div>
      <h3 className="mt-5 font-display text-lg font-bold uppercase tracking-[0.12em] text-white/70">
        Leader Slot {index}
      </h3>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/60">
        {platform === "pc" ? "PC Editor" : "Mobile Editor"} · TBA
      </p>
      <p className="mt-4 text-[13px] leading-relaxed text-mist/55">
        This leader has not been announced yet. Details are published by the organizing team.
      </p>
    </div>
  );
}

/* -------------------------------- timeline -------------------------------- */

export function TimelineList({
  events,
  notificationWindow,
}: {
  events: TimelineEvent[];
  notificationWindow?: NotificationWindow;
}) {
  return (
    <ol className="relative space-y-4 border-l border-white/10 pl-6 sm:pl-8">
      {events.map((event) => {
        const computedDate =
          event.phaseKey === "notification_deadline" && !event.eventDate
            ? (notificationWindow?.notificationDeadline ?? null)
            : event.eventDate;
        const isDerived = event.phaseKey === "notification_deadline" && !event.eventDate && computedDate;

        return (
          <li key={event.id} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] top-5 h-3 w-3 rounded-full border-2 sm:-left-[39px]",
                event.status === "completed"
                  ? "border-gold bg-gold"
                  : event.status === "active"
                    ? "status-dot border-gold bg-gold/40"
                    : "border-white/25 bg-ink",
              )}
            />
            <div className="rounded-2xl panel p-5 transition hover:border-gold/25 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                  {event.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                  <CalendarClock size={13} />
                  {formatDate(computedDate)}
                </span>
              </div>
              {event.description ? (
                <p className="mt-3 text-[13px] leading-relaxed text-mist/65">{event.description}</p>
              ) : null}
              {isDerived ? (
                <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-mist/45">
                  Auto-calculated: registration close + {notificationWindow?.windowDays} days
                </p>
              ) : null}
              <div className="mt-4">
                <Badge tone={event.status === "completed" ? "green" : event.status === "active" ? "gold" : "neutral"}>
                  {event.status}
                </Badge>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------ announcements ------------------------------ */

export function AnnouncementList({ items }: { items: Announcement[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Card key={item.id} hover>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/80">
              {formatDateTime(item.publishedAt ?? item.createdAt)}
            </span>
            {item.isPinned ? <Badge tone="gold">Pinned</Badge> : null}
          </div>
          <h3 className="mt-3 text-base font-bold uppercase tracking-[0.08em] text-white">
            {item.title}
          </h3>
          <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-mist/70">
            {item.body}
          </p>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------- status card ------------------------------- */

export function NotificationWindowCard({ window }: { window: NotificationWindow }) {
  const tone =
    window.state === "deadline_passed"
      ? "red"
      : window.state === "deadline_approaching"
        ? "amber"
        : window.state === "not_configured"
          ? "neutral"
          : "gold";

  return (
    <Card className="border-gold/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone={tone}>{window.label}</Badge>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mist/60">
          {window.windowDays}-day notification rule
        </span>
      </div>
      <dl className="mt-6 grid gap-5 sm:grid-cols-3">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist/50">
            Registration closes
          </dt>
          <dd className="mt-1 font-display text-lg font-bold text-white">
            {formatDate(window.registrationClosesAt)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist/50">
            Notification deadline
          </dt>
          <dd className="mt-1 font-display text-lg font-bold gold-text">
            {formatDate(window.notificationDeadline)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist/50">
            Days remaining
          </dt>
          <dd className="mt-1 font-display text-lg font-bold text-white">
            {window.daysRemaining === null ? "TBA" : Math.max(window.daysRemaining, 0)}
          </dd>
        </div>
      </dl>
      <p className="mt-5 text-[13px] leading-relaxed text-mist/65">{window.detail}</p>
    </Card>
  );
}

/* --------------------------------- CTA band -------------------------------- */

export function RegistrationCta({ open }: { open: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-[linear-gradient(120deg,rgba(139,92,246,0.14),rgba(7,11,22,0.9)_45%)] px-7 py-12 sm:px-12">
      <div className="relative max-w-2xl">
        <Eyebrow>Claim your seat</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold uppercase leading-tight text-white sm:text-4xl">
          {open ? "Registration is open" : "Registration is currently closed"}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-mist/75">
          {open
            ? "Submit your audition edit and let the organizing team review your craft. Sixteen editors will make the final roster."
            : "The registration form is closed right now. Follow the announcements for the next opening."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#cbb3ff] via-[#a78bfa] to-[#7c3aed] px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-ink transition hover:brightness-110"
          >
            {open ? "Register Now" : "View registration"}
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/rules"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-gold/50 hover:text-gold"
          >
            Read the rules
          </Link>
        </div>
      </div>
    </div>
  );
}
