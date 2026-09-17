import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export const adminRoleEnum = pgEnum("admin_role", ["owner", "organizer", "reviewer"]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending_review",
  "under_review",
  "shortlisted",
  "selected",
  "not_selected",
]);

export const platformEnum = pgEnum("editor_platform", ["pc", "mobile", "both"]);

export const competitionStatusEnum = pgEnum("competition_status", [
  "registration_open",
  "registration_closed",
  "auditions_under_review",
  "selection_in_progress",
  "final_16_selected",
  "team_formation",
  "competition_live",
  "results",
  "competition_completed",
]);

export const timelineStatusEnum = pgEnum("timeline_status", ["upcoming", "active", "completed"]);

export const notificationStatusEnum = pgEnum("notification_status", ["queued", "sent", "failed"]);

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export const adminUsers = pgTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: adminRoleEnum("role").notNull().default("organizer"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("admin_users_email_unique").on(table.email)],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: serial("id").primaryKey(),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    userAgent: varchar("user_agent", { length: 300 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("admin_sessions_token_unique").on(table.tokenHash),
    index("admin_sessions_admin_idx").on(table.adminId),
  ],
);

/* ------------------------------------------------------------------ */
/* Competition configuration (singleton row, id = 1)                   */
/* ------------------------------------------------------------------ */

export const competitionSettings = pgTable("competition_settings", {
  id: integer("id").primaryKey().default(1),
  status: competitionStatusEnum("status").notNull().default("registration_open"),
  seasonLabel: varchar("season_label", { length: 120 }).notNull().default("Season 01"),
  registrationOpensAt: timestamp("registration_opens_at", { withTimezone: true }),
  registrationClosesAt: timestamp("registration_closes_at", { withTimezone: true }),
  notificationWindowDays: integer("notification_window_days").notNull().default(20),
  leaderSlots: integer("leader_slots").notNull().default(4),
  editorSlots: integer("editor_slots").notNull().default(16),
  auditionCount: integer("audition_count").notNull().default(1),
  defaultTeamCapacity: integer("default_team_capacity").notNull().default(4),
  registrationFormOpen: boolean("registration_form_open").notNull().default(true),
  final16Published: boolean("final_16_published").notNull().default(false),
  final16PublishedAt: timestamp("final_16_published_at", { withTimezone: true }),
  teamsPublished: boolean("teams_published").notNull().default(false),
  teamsPublishedAt: timestamp("teams_published_at", { withTimezone: true }),
  resultsPublished: boolean("results_published").notNull().default(false),
  resultsPlaceholderText: text("results_placeholder_text")
    .notNull()
    .default("Results will be announced soon."),
  aboutIntro: text("about_intro").notNull().default(""),
  contactEmail: varchar("contact_email", { length: 200 }).notNull().default(""),
  contactDiscord: varchar("contact_discord", { length: 200 }).notNull().default(""),
  contactInstagram: varchar("contact_instagram", { length: 200 }).notNull().default(""),
  contactYoutube: varchar("contact_youtube", { length: 200 }).notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Registrations & evaluations                                         */
/* ------------------------------------------------------------------ */

export const registrations = pgTable(
  "registrations",
  {
    id: serial("id").primaryKey(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    editingUsername: varchar("editing_username", { length: 80 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    submissionLink: text("submission_link").notNull(),
    youtubeHandle: varchar("youtube_handle", { length: 120 }),
    instagramUsername: varchar("instagram_username", { length: 120 }),
    editingSoftware: varchar("editing_software", { length: 160 }),
    portfolioLink: text("portfolio_link"),
    introduction: text("introduction"),
    platform: platformEnum("platform"),
    avatarUrl: text("avatar_url"),
    status: registrationStatusEnum("status").notNull().default("pending_review"),
    internalNotes: text("internal_notes"),
    statusUpdatedAt: timestamp("status_updated_at", { withTimezone: true }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("registrations_email_unique").on(table.email),
    uniqueIndex("registrations_username_unique").on(table.editingUsername),
    index("registrations_status_idx").on(table.status),
  ],
);

export const evaluations = pgTable(
  "evaluations",
  {
    id: serial("id").primaryKey(),
    registrationId: integer("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    creativity: integer("creativity"),
    effort: integer("effort"),
    cleanliness: integer("cleanliness"),
    overallQuality: integer("overall_quality"),
    reviewerNotes: text("reviewer_notes"),
    reviewedBy: integer("reviewed_by").references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("evaluations_registration_unique").on(table.registrationId)],
);

/* ------------------------------------------------------------------ */
/* Leaders & teams                                                     */
/* ------------------------------------------------------------------ */

export const leaders = pgTable(
  "leaders",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 120 }).notNull(),
    platform: platformEnum("platform").notNull().default("pc"),
    editingStyle: varchar("editing_style", { length: 200 }),
    biography: text("biography"),
    imageUrl: text("image_url"),
    youtubeUrl: text("youtube_url"),
    instagramUrl: text("instagram_url"),
    xUrl: text("x_url"),
    discordHandle: varchar("discord_handle", { length: 120 }),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("leaders_sort_idx").on(table.sortOrder)],
);

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  motto: varchar("motto", { length: 200 }),
  leaderId: integer("leader_id").references(() => leaders.id, { onDelete: "set null" }),
  capacity: integer("capacity").notNull().default(4),
  sortOrder: integer("sort_order").notNull().default(0),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    registrationId: integer("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    assignedBy: integer("assigned_by").references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("team_members_registration_unique").on(table.registrationId)],
);

/* ------------------------------------------------------------------ */
/* Content: timeline, rules, announcements, results                    */
/* ------------------------------------------------------------------ */

export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  phaseKey: varchar("phase_key", { length: 80 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  eventDate: timestamp("event_date", { withTimezone: true }),
  status: timelineStatusEnum("status").notNull().default("upcoming"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ruleSections = pgTable("rule_sections", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  isPinned: boolean("is_pinned").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  roundName: varchar("round_name", { length: 160 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  summary: text("summary"),
  body: text("body"),
  teamId: integer("team_id").references(() => teams.id, { onDelete: "set null" }),
  placement: varchar("placement", { length: 80 }),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Notifications & contact                                             */
/* ------------------------------------------------------------------ */

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").references(() => registrations.id, {
    onDelete: "cascade",
  }),
  kind: varchar("kind", { length: 80 }).notNull().default("selection"),
  subject: varchar("subject", { length: 200 }).notNull(),
  body: text("body").notNull(),
  status: notificationStatusEnum("status").notNull().default("queued"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isHandled: boolean("is_handled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Relations                                                           */
/* ------------------------------------------------------------------ */

export const registrationRelations = relations(registrations, ({ one }) => ({
  evaluation: one(evaluations, {
    fields: [registrations.id],
    references: [evaluations.registrationId],
  }),
  teamMembership: one(teamMembers, {
    fields: [registrations.id],
    references: [teamMembers.registrationId],
  }),
}));

export const teamRelations = relations(teams, ({ one, many }) => ({
  leader: one(leaders, { fields: [teams.leaderId], references: [leaders.id] }),
  members: many(teamMembers),
}));

export const teamMemberRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  registration: one(registrations, {
    fields: [teamMembers.registrationId],
    references: [registrations.id],
  }),
}));

export type Registration = typeof registrations.$inferSelect;
export type Evaluation = typeof evaluations.$inferSelect;
export type Leader = typeof leaders.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type RuleSection = typeof ruleSections.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type ResultRow = typeof results.$inferSelect;
export type CompetitionSettings = typeof competitionSettings.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
