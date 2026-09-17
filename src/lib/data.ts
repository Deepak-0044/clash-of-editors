import { and, asc, count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  announcements,
  competitionSettings,
  leaders,
  registrations,
  results,
  ruleSections,
  teamMembers,
  teams,
  timelineEvents,
  type Announcement,
  type CompetitionSettings,
  type Leader,
  type ResultRow,
  type RuleSection,
  type TimelineEvent,
} from "@/db/schema";
import { DEFAULT_TIMELINE_PHASES } from "@/lib/competition";

export const FALLBACK_SETTINGS: CompetitionSettings = {
  id: 1,
  status: "registration_open",
  seasonLabel: "Season 01",
  registrationOpensAt: null,
  registrationClosesAt: null,
  notificationWindowDays: 20,
  leaderSlots: 4,
  editorSlots: 16,
  auditionCount: 1,
  defaultTeamCapacity: 4,
  registrationFormOpen: true,
  final16Published: false,
  final16PublishedAt: null,
  teamsPublished: false,
  teamsPublishedAt: null,
  resultsPublished: false,
  resultsPlaceholderText: "Results will be announced soon.",
  aboutIntro: "",
  contactEmail: "",
  contactDiscord: "",
  contactInstagram: "",
  contactYoutube: "",
  updatedAt: new Date(),
};

const DEFAULT_RULE_SECTIONS: { title: string; body: string }[] = [
  {
    title: "Eligibility",
    body: "Open to anime / video editors on PC or mobile. Editors of any region may enter. Additional eligibility requirements will be published by the organizing team. (Editable by organizers.)",
  },
  {
    title: "Registration Rules",
    body: "One registration per editor. The editing username and email address you register with must belong to you. Duplicate entries will be removed. (Editable by organizers.)",
  },
  {
    title: "Audition Submission Rules",
    body: "Each editor submits one audition edit through a publicly accessible link. Make sure the link is not private, expired or region locked. (Editable by organizers.)",
  },
  {
    title: "Editing Requirements",
    body: "The audition must be your own original edit. Specific length, resolution and content requirements will be published by the organizing team. (Editable by organizers.)",
  },
  {
    title: "Submission Deadlines",
    body: "Submissions must arrive before the registration closing date shown on the Timeline page. Late submissions are not reviewed. Dates marked TBA are not confirmed yet.",
  },
  {
    title: "Review Process",
    body: "Every audition is reviewed manually by the organizing team on creativity, effort, cleanliness and overall edit quality. Internal scores are for reference only and never decide selection automatically.",
  },
  {
    title: "Selection Process",
    body: "Exactly 16 editors are selected manually by the organizers. Selection results stay private until the Final 16 is officially published.",
  },
  {
    title: "Team Formation",
    body: "The four leaders and the organizing team manually divide the Final 16 into teams based on style, strengths, platform and balance. No automatic assignment is used.",
  },
  {
    title: "Competition Conduct",
    body: "Respect other competitors, leaders and judges. Harassment, hate speech or targeted attacks are not tolerated. (Editable by organizers.)",
  },
  {
    title: "Disqualification Conditions",
    body: "Stolen edits, reused project files from other creators, AI-generated submissions presented as your own work, vote manipulation or abusive conduct lead to immediate disqualification.",
  },
  {
    title: "Organizer Rights",
    body: "The organizing team may adjust rules, deadlines, rounds or formats when necessary, and will announce any change on the Announcements section.",
  },
  {
    title: "Contact & Support",
    body: "Questions about the rules can be sent through the Contact page. Support channels are listed there once configured by the organizers.",
  },
];

let bootstrapPromise: Promise<void> | null = null;

async function runBootstrap() {
  await db
    .insert(competitionSettings)
    .values({ id: 1 })
    .onConflictDoNothing({ target: competitionSettings.id });

  const [{ value: timelineCount }] = await db
    .select({ value: count() })
    .from(timelineEvents);
  if (timelineCount === 0) {
    await db.insert(timelineEvents).values(
      DEFAULT_TIMELINE_PHASES.map((phase, index) => ({
        phaseKey: phase.phaseKey,
        title: phase.title,
        description: null,
        eventDate: null,
        sortOrder: index,
        isPublished: true,
      })),
    );
  }

  const [{ value: ruleCount }] = await db.select({ value: count() }).from(ruleSections);
  if (ruleCount === 0) {
    await db.insert(ruleSections).values(
      DEFAULT_RULE_SECTIONS.map((section, index) => ({
        title: section.title,
        body: section.body,
        sortOrder: index,
        isPublished: true,
      })),
    );
  }

  const [{ value: leaderCount }] = await db.select({ value: count() }).from(leaders);
  if (leaderCount === 0) {
    await db.insert(leaders).values(DEFAULT_LEADERS);
  }
}

export const DEFAULT_LEADERS = [
  {
    username: "Devansh Editz",
    platform: "mobile" as const,
    editingStyle: "Neon impact · high-energy mobile edits",
    biography:
      "Mobile editor known for high-impact neon effects, glowing visuals and punchy timing.",
    imageUrl: "/images/leaders/devansh.jpg",
    sortOrder: 0,
    isPublished: true,
  },
  {
    username: "Inocent Editz",
    platform: "pc" as const,
    editingStyle: "Cinematic glow · smooth transitions",
    biography:
      "PC editor with a smooth cinematic style, glowing transitions and a clean sense of flow.",
    imageUrl: "/images/leaders/inocent.jpg",
    sortOrder: 1,
    isPublished: true,
  },
  {
    username: "Zoid 45",
    platform: "pc" as const,
    editingStyle: "Clean technical · sharp sync",
    biography:
      "PC editor focused on technical cleanliness, razor-sharp sync and precise execution.",
    imageUrl: "/images/leaders/zoid45.jpg",
    sortOrder: 2,
    isPublished: true,
  },
  {
    username: "Otaku",
    platform: "mobile" as const,
    editingStyle: "Dark cinematic · atmospheric",
    biography:
      "Mobile editor with a dark, atmospheric cinematic style and mood-driven storytelling.",
    imageUrl: "/images/leaders/otaku.jpg",
    sortOrder: 3,
    isPublished: true,
  },
];

export async function ensureBootstrap(): Promise<boolean> {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }
  try {
    await bootstrapPromise;
    return true;
  } catch {
    return false;
  }
}

export async function getSettings(): Promise<CompetitionSettings> {
  try {
    await ensureBootstrap();
    const rows = await db.select().from(competitionSettings).where(eq(competitionSettings.id, 1));
    return rows[0] ?? FALLBACK_SETTINGS;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export async function getPublishedLeaders(): Promise<Leader[]> {
  try {
    await ensureBootstrap();
    return await db
      .select()
      .from(leaders)
      .where(and(eq(leaders.isPublished, true), eq(leaders.isDeleted, false)))
      .orderBy(asc(leaders.sortOrder), asc(leaders.id));
  } catch {
    return [];
  }
}

export async function getAllLeaders(): Promise<Leader[]> {
  try {
    await ensureBootstrap();
    return await db
      .select()
      .from(leaders)
      .where(eq(leaders.isDeleted, false))
      .orderBy(asc(leaders.sortOrder), asc(leaders.id));
  } catch {
    return [];
  }
}

export async function getTimelineEvents(publishedOnly = true): Promise<TimelineEvent[]> {
  try {
    await ensureBootstrap();
    const query = db.select().from(timelineEvents);
    const rows = publishedOnly
      ? await query.where(eq(timelineEvents.isPublished, true)).orderBy(asc(timelineEvents.sortOrder))
      : await query.orderBy(asc(timelineEvents.sortOrder));
    return rows;
  } catch {
    return [];
  }
}

export async function getRuleSections(publishedOnly = true): Promise<RuleSection[]> {
  try {
    await ensureBootstrap();
    const query = db.select().from(ruleSections);
    const rows = publishedOnly
      ? await query.where(eq(ruleSections.isPublished, true)).orderBy(asc(ruleSections.sortOrder))
      : await query.orderBy(asc(ruleSections.sortOrder));
    return rows;
  } catch {
    return [];
  }
}

export async function getPublishedAnnouncements(limit = 20): Promise<Announcement[]> {
  try {
    await ensureBootstrap();
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.isPublished, true))
      .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt), desc(announcements.id))
      .limit(limit);
  } catch {
    return [];
  }
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  try {
    await ensureBootstrap();
    return await db.select().from(announcements).orderBy(desc(announcements.id));
  } catch {
    return [];
  }
}

export async function getPublishedResults(): Promise<ResultRow[]> {
  try {
    await ensureBootstrap();
    return await db
      .select()
      .from(results)
      .where(eq(results.isPublished, true))
      .orderBy(asc(results.sortOrder), desc(results.id));
  } catch {
    return [];
  }
}

export async function getAllResults(): Promise<ResultRow[]> {
  try {
    await ensureBootstrap();
    return await db.select().from(results).orderBy(asc(results.sortOrder), desc(results.id));
  } catch {
    return [];
  }
}

export type PublicEditor = {
  id: number;
  username: string;
  platform: "pc" | "mobile" | "both" | null;
  avatarUrl: string | null;
  youtubeHandle: string | null;
  instagramUsername: string | null;
  teamName: string | null;
  leaderName: string | null;
};

/**
 * Public editors are only exposed after the Final 16 is published.
 * Emails, notes and internal scores are never selected here.
 */
export async function getPublicEditors(settings: CompetitionSettings): Promise<PublicEditor[]> {
  if (!settings.final16Published) return [];
  try {
    const rows = await db
      .select({
        id: registrations.id,
        username: registrations.editingUsername,
        platform: registrations.platform,
        avatarUrl: registrations.avatarUrl,
        youtubeHandle: registrations.youtubeHandle,
        instagramUsername: registrations.instagramUsername,
        teamName: teams.name,
        leaderName: leaders.username,
      })
      .from(registrations)
      .leftJoin(teamMembers, eq(teamMembers.registrationId, registrations.id))
      .leftJoin(teams, eq(teams.id, teamMembers.teamId))
      .leftJoin(leaders, eq(leaders.id, teams.leaderId))
      .where(and(eq(registrations.status, "selected"), eq(registrations.isDeleted, false)))
      .orderBy(asc(registrations.editingUsername));

    return rows.map((row) => ({
      ...row,
      teamName: settings.teamsPublished ? row.teamName : null,
      leaderName: settings.teamsPublished ? row.leaderName : null,
    }));
  } catch {
    return [];
  }
}

export type RegistrationStats = {
  total: number;
  pending: number;
  underReview: number;
  shortlisted: number;
  selected: number;
  notSelected: number;
};

export async function getRegistrationStats(): Promise<RegistrationStats> {
  const empty: RegistrationStats = {
    total: 0,
    pending: 0,
    underReview: 0,
    shortlisted: 0,
    selected: 0,
    notSelected: 0,
  };
  try {
    const rows = await db
      .select({ status: registrations.status, value: count() })
      .from(registrations)
      .where(eq(registrations.isDeleted, false))
      .groupBy(registrations.status);

    return rows.reduce((acc, row) => {
      acc.total += row.value;
      if (row.status === "pending_review") acc.pending = row.value;
      if (row.status === "under_review") acc.underReview = row.value;
      if (row.status === "shortlisted") acc.shortlisted = row.value;
      if (row.status === "selected") acc.selected = row.value;
      if (row.status === "not_selected") acc.notSelected = row.value;
      return acc;
    }, empty);
  } catch {
    return empty;
  }
}

export async function getSelectedCount(): Promise<number> {
  try {
    const rows = await db
      .select({ value: count() })
      .from(registrations)
      .where(and(eq(registrations.status, "selected"), eq(registrations.isDeleted, false)));
    return rows[0]?.value ?? 0;
  } catch {
    return 0;
  }
}

export type TeamWithMembers = {
  team: typeof teams.$inferSelect;
  leader: Leader | null;
  members: {
    id: number;
    registrationId: number;
    username: string;
    platform: "pc" | "mobile" | "both" | null;
  }[];
};

export async function getTeamsWithMembers(): Promise<TeamWithMembers[]> {
  try {
    await ensureBootstrap();
    const teamRows = await db
      .select({ team: teams, leader: leaders })
      .from(teams)
      .leftJoin(leaders, eq(leaders.id, teams.leaderId))
      .where(eq(teams.isDeleted, false))
      .orderBy(asc(teams.sortOrder), asc(teams.id));

    const memberRows = await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        registrationId: registrations.id,
        username: registrations.editingUsername,
        platform: registrations.platform,
      })
      .from(teamMembers)
      .innerJoin(registrations, eq(registrations.id, teamMembers.registrationId))
      .orderBy(asc(registrations.editingUsername));

    return teamRows.map(({ team, leader }) => ({
      team,
      leader,
      members: memberRows
        .filter((member) => member.teamId === team.id)
        .map(({ id, registrationId, username, platform }) => ({
          id,
          registrationId,
          username,
          platform,
        })),
    }));
  } catch {
    return [];
  }
}

export async function countRows(table: "registrations" | "announcements"): Promise<number> {
  try {
    const rows =
      table === "registrations"
        ? await db.select({ value: count() }).from(registrations)
        : await db.select({ value: count() }).from(announcements);
    return rows[0]?.value ?? 0;
  } catch {
    return 0;
  }
}

export const nowSql = sql`now()`;
