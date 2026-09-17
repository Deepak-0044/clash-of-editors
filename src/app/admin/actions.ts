"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, count, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  adminUsers,
  announcements,
  competitionSettings,
  evaluations,
  leaders,
  notifications,
  registrations,
  results,
  ruleSections,
  teamMembers,
  teams,
  timelineEvents,
} from "@/db/schema";
import {
  adminCount,
  can,
  createSession,
  destroySession,
  hashPassword,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";
import { ensureBootstrap } from "@/lib/data";
import type { ActionState } from "@/lib/action-state";
import { loginSchema, setupSchema } from "@/lib/validation";

/* ------------------------------- helpers -------------------------------- */

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function requiredStr(formData: FormData, key: string, fallback = ""): string {
  return str(formData, key) ?? fallback;
}

function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function bool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

function dateOrNull(formData: FormData, key: string): Date | null {
  const value = str(formData, key);
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function backTo(path: string, message: string, tone: "ok" | "error" = "ok"): never {
  redirect(`${path}?msg=${encodeURIComponent(message)}&tone=${tone}`);
}

async function guard(permission: Parameters<typeof can>[1]) {
  const admin = await requireAdmin();
  if (!can(admin.role, permission)) {
    throw new Error("You do not have permission to perform this action.");
  }
  return admin;
}

/* ------------------------------ auth actions ----------------------------- */

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email and password." };
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    const user = rows[0];
    if (!user || !user.isActive) {
      return { ok: false, error: "Invalid credentials." };
    }
    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return { ok: false, error: "Invalid credentials." };
    }

    const headerList = await headers();
    await createSession(user.id, headerList.get("user-agent"));
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, user.id));
  } catch {
    return { ok: false, error: "Sign-in failed. Please try again." };
  }

  redirect("/admin/dashboard");
}

export async function setupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = setupSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    setupToken: String(formData.get("setupToken") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const existing = await adminCount();
  if (existing === -1) {
    return { ok: false, error: "Database unavailable. Try again shortly." };
  }

  const requiredToken = process.env.ADMIN_SETUP_TOKEN;
  if (existing > 0) {
    if (!requiredToken || parsed.data.setupToken !== requiredToken) {
      return {
        ok: false,
        error:
          "An organizer account already exists. Provide the ADMIN_SETUP_TOKEN to create another owner account.",
      };
    }
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const [created] = await db
      .insert(adminUsers)
      .values({
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: "owner",
      })
      .returning({ id: adminUsers.id });

    await ensureBootstrap();
    const headerList = await headers();
    await createSession(created.id, headerList.get("user-agent"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("unique") || message.includes("duplicate key")) {
      return { ok: false, error: "An account with that email already exists." };
    }
    return { ok: false, error: "Could not create the account. Try again." };
  }

  redirect("/admin/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/* ---------------------------- settings actions --------------------------- */

export async function updateSettingsAction(formData: FormData): Promise<void> {
  await guard("manage_content");

  await db
    .update(competitionSettings)
    .set({
      status: (str(formData, "status") ?? "registration_open") as
        | "registration_open"
        | "registration_closed"
        | "auditions_under_review"
        | "selection_in_progress"
        | "final_16_selected"
        | "team_formation"
        | "competition_live"
        | "results"
        | "competition_completed",
      seasonLabel: requiredStr(formData, "seasonLabel", "Season 01"),
      registrationOpensAt: dateOrNull(formData, "registrationOpensAt"),
      registrationClosesAt: dateOrNull(formData, "registrationClosesAt"),
      notificationWindowDays: num(formData, "notificationWindowDays") ?? 20,
      leaderSlots: num(formData, "leaderSlots") ?? 4,
      editorSlots: num(formData, "editorSlots") ?? 16,
      auditionCount: num(formData, "auditionCount") ?? 1,
      defaultTeamCapacity: num(formData, "defaultTeamCapacity") ?? 4,
      registrationFormOpen: bool(formData, "registrationFormOpen"),
      resultsPublished: bool(formData, "resultsPublished"),
      resultsPlaceholderText: requiredStr(
        formData,
        "resultsPlaceholderText",
        "Results will be announced soon.",
      ),
      aboutIntro: requiredStr(formData, "aboutIntro"),
      contactEmail: requiredStr(formData, "contactEmail"),
      contactDiscord: requiredStr(formData, "contactDiscord"),
      contactInstagram: requiredStr(formData, "contactInstagram"),
      contactYoutube: requiredStr(formData, "contactYoutube"),
      updatedAt: new Date(),
    })
    .where(eq(competitionSettings.id, 1));

  revalidatePath("/", "layout");
  backTo("/admin/settings", "Competition settings saved.");
}

/* -------------------------- registration actions ------------------------- */

export async function updateRegistrationStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = num(formData, "id");
  const status = str(formData, "status") as
    | "pending_review"
    | "under_review"
    | "shortlisted"
    | "selected"
    | "not_selected"
    | null;
  const returnTo = str(formData, "returnTo") ?? "/admin/registrations";

  if (!id || !status) backTo(returnTo, "Invalid request.", "error");

  const needsSelectionRights = status === "selected" || status === "not_selected";
  if (needsSelectionRights && !can(admin.role, "manage_selection")) {
    backTo(returnTo, "Your role cannot change final selection decisions.", "error");
  }

  if (status === "selected") {
    const [settings] = await db
      .select({ editorSlots: competitionSettings.editorSlots })
      .from(competitionSettings)
      .where(eq(competitionSettings.id, 1));
    const limit = settings?.editorSlots ?? 16;

    const [current] = await db
      .select({ value: count() })
      .from(registrations)
      .where(and(eq(registrations.status, "selected"), eq(registrations.isDeleted, false)));

    const [target] = await db
      .select({ status: registrations.status })
      .from(registrations)
      .where(eq(registrations.id, id));

    if (target?.status !== "selected" && (current?.value ?? 0) >= limit) {
      backTo(
        returnTo,
        `Selection limit reached — only ${limit} editors can be selected. Remove one first.`,
        "error",
      );
    }
  }

  await db
    .update(registrations)
    .set({ status, statusUpdatedAt: new Date(), updatedAt: new Date() })
    .where(eq(registrations.id, id));

  if (status !== "selected") {
    await db.delete(teamMembers).where(eq(teamMembers.registrationId, id));
  }

  revalidatePath("/admin/registrations");
  revalidatePath("/admin/final-16");
  revalidatePath("/editors");
  backTo(returnTo, "Participant status updated.");
}

export async function saveEvaluationAction(formData: FormData): Promise<void> {
  const admin = await guard("evaluate");
  const registrationId = num(formData, "registrationId");
  if (!registrationId) backTo("/admin/registrations", "Invalid request.", "error");

  const clamp = (value: number | null) =>
    value === null ? null : Math.max(0, Math.min(10, Math.round(value)));

  const values = {
    creativity: clamp(num(formData, "creativity")),
    effort: clamp(num(formData, "effort")),
    cleanliness: clamp(num(formData, "cleanliness")),
    overallQuality: clamp(num(formData, "overallQuality")),
    reviewerNotes: str(formData, "reviewerNotes"),
    reviewedBy: admin.id,
    updatedAt: new Date(),
  };

  await db
    .insert(evaluations)
    .values({ registrationId, ...values })
    .onConflictDoUpdate({ target: evaluations.registrationId, set: values });

  const internalNotes = str(formData, "internalNotes");
  await db
    .update(registrations)
    .set({ internalNotes, updatedAt: new Date() })
    .where(eq(registrations.id, registrationId));

  revalidatePath(`/admin/registrations/${registrationId}`);
  backTo(`/admin/registrations/${registrationId}`, "Evaluation saved.");
}

export async function softDeleteRegistrationAction(formData: FormData): Promise<void> {
  await guard("manage_selection");
  const id = num(formData, "id");
  if (!id) backTo("/admin/registrations", "Invalid request.", "error");

  await db
    .update(registrations)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(registrations.id, id));
  await db.delete(teamMembers).where(eq(teamMembers.registrationId, id));

  revalidatePath("/admin/registrations");
  backTo("/admin/registrations", "Registration archived.");
}

/* ----------------------------- final 16 actions -------------------------- */

export async function publishFinal16Action(formData: FormData): Promise<void> {
  await guard("publish");
  const publish = bool(formData, "publish");

  if (publish) {
    const [settings] = await db
      .select()
      .from(competitionSettings)
      .where(eq(competitionSettings.id, 1));
    const [selected] = await db
      .select({ value: count() })
      .from(registrations)
      .where(and(eq(registrations.status, "selected"), eq(registrations.isDeleted, false)));

    const limit = settings?.editorSlots ?? 16;
    if ((selected?.value ?? 0) === 0) {
      backTo("/admin/final-16", "Select editors before publishing the Final 16.", "error");
    }
    if ((selected?.value ?? 0) > limit) {
      backTo("/admin/final-16", `More than ${limit} editors are selected.`, "error");
    }

    const selectedRows = await db
      .select({ id: registrations.id, username: registrations.editingUsername })
      .from(registrations)
      .where(and(eq(registrations.status, "selected"), eq(registrations.isDeleted, false)));

    if (selectedRows.length > 0) {
      await db.insert(notifications).values(
        selectedRows.map((row) => ({
          registrationId: row.id,
          kind: "selection",
          subject: "You have been selected for the Clash of Editors Final 16",
          body: `Congratulations ${row.username} — the organizing team has selected you for the Final 16. Team formation details will follow.`,
          status: "queued" as const,
        })),
      );
    }
  }

  await db
    .update(competitionSettings)
    .set({
      final16Published: publish,
      final16PublishedAt: publish ? new Date() : null,
      status: publish ? "final_16_selected" : "selection_in_progress",
      updatedAt: new Date(),
    })
    .where(eq(competitionSettings.id, 1));

  revalidatePath("/", "layout");
  backTo(
    "/admin/final-16",
    publish ? "Final 16 published — the roster is now public." : "Final 16 unpublished.",
  );
}

/* ------------------------------ leader actions --------------------------- */

export async function saveLeaderAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  const values = {
    username: requiredStr(formData, "username", "TBA"),
    platform: (str(formData, "platform") ?? "pc") as "pc" | "mobile" | "both",
    editingStyle: str(formData, "editingStyle"),
    biography: str(formData, "biography"),
    imageUrl: str(formData, "imageUrl"),
    youtubeUrl: str(formData, "youtubeUrl"),
    instagramUrl: str(formData, "instagramUrl"),
    xUrl: str(formData, "xUrl"),
    discordHandle: str(formData, "discordHandle"),
    sortOrder: num(formData, "sortOrder") ?? 0,
    isPublished: bool(formData, "isPublished"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(leaders).set(values).where(eq(leaders.id, id));
  } else {
    await db.insert(leaders).values(values);
  }

  revalidatePath("/leaders");
  revalidatePath("/admin/leaders");
  backTo("/admin/leaders", id ? "Leader updated." : "Leader created.");
}

export async function deleteLeaderAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  if (!id) backTo("/admin/leaders", "Invalid request.", "error");

  await db
    .update(leaders)
    .set({ isDeleted: true, isPublished: false, updatedAt: new Date() })
    .where(eq(leaders.id, id));

  revalidatePath("/leaders");
  backTo("/admin/leaders", "Leader removed.");
}

/* ------------------------------- team actions ---------------------------- */

export async function saveTeamAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  const values = {
    name: requiredStr(formData, "name", "Team"),
    motto: str(formData, "motto"),
    leaderId: num(formData, "leaderId"),
    capacity: num(formData, "capacity") ?? 4,
    sortOrder: num(formData, "sortOrder") ?? 0,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(teams).set(values).where(eq(teams.id, id));
  } else {
    await db.insert(teams).values(values);
  }

  revalidatePath("/admin/teams");
  revalidatePath("/editors");
  backTo("/admin/teams", id ? "Team updated." : "Team created.");
}

export async function deleteTeamAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  if (!id) backTo("/admin/teams", "Invalid request.", "error");

  await db.delete(teamMembers).where(eq(teamMembers.teamId, id));
  await db.update(teams).set({ isDeleted: true, updatedAt: new Date() }).where(eq(teams.id, id));

  revalidatePath("/admin/teams");
  backTo("/admin/teams", "Team deleted.");
}

export async function assignEditorAction(formData: FormData): Promise<void> {
  const admin = await guard("manage_selection");
  const teamId = num(formData, "teamId");
  const registrationId = num(formData, "registrationId");
  if (!teamId || !registrationId) backTo("/admin/teams", "Invalid request.", "error");

  const [participant] = await db
    .select({ status: registrations.status })
    .from(registrations)
    .where(eq(registrations.id, registrationId));

  if (participant?.status !== "selected") {
    backTo("/admin/teams", "Only selected editors can be assigned to competition teams.", "error");
  }

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) backTo("/admin/teams", "Team not found.", "error");

  const [members] = await db
    .select({ value: count() })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  if ((members?.value ?? 0) >= team.capacity) {
    backTo("/admin/teams", `${team.name} is already at capacity (${team.capacity}).`, "error");
  }

  await db
    .insert(teamMembers)
    .values({ teamId, registrationId, assignedBy: admin.id })
    .onConflictDoUpdate({
      target: teamMembers.registrationId,
      set: { teamId, assignedBy: admin.id },
    });

  revalidatePath("/admin/teams");
  revalidatePath("/editors");
  backTo("/admin/teams", "Editor assigned.");
}

export async function removeTeamMemberAction(formData: FormData): Promise<void> {
  await guard("manage_selection");
  const registrationId = num(formData, "registrationId");
  if (!registrationId) backTo("/admin/teams", "Invalid request.", "error");

  await db.delete(teamMembers).where(eq(teamMembers.registrationId, registrationId));

  revalidatePath("/admin/teams");
  revalidatePath("/editors");
  backTo("/admin/teams", "Editor removed from team.");
}

export async function publishTeamsAction(formData: FormData): Promise<void> {
  await guard("publish");
  const publish = bool(formData, "publish");

  await db
    .update(competitionSettings)
    .set({
      teamsPublished: publish,
      teamsPublishedAt: publish ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(competitionSettings.id, 1));

  revalidatePath("/", "layout");
  backTo("/admin/teams", publish ? "Team assignments published." : "Team assignments hidden.");
}

/* ----------------------------- timeline actions -------------------------- */

export async function saveTimelineEventAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  const values = {
    phaseKey: requiredStr(formData, "phaseKey", `phase_${Date.now()}`),
    title: requiredStr(formData, "title", "Untitled phase"),
    description: str(formData, "description"),
    eventDate: dateOrNull(formData, "eventDate"),
    status: (str(formData, "status") ?? "upcoming") as "upcoming" | "active" | "completed",
    sortOrder: num(formData, "sortOrder") ?? 0,
    isPublished: bool(formData, "isPublished"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(timelineEvents).set(values).where(eq(timelineEvents.id, id));
  } else {
    await db.insert(timelineEvents).values(values);
  }

  revalidatePath("/timeline");
  backTo("/admin/timeline", id ? "Timeline event updated." : "Timeline event created.");
}

export async function deleteTimelineEventAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  if (!id) backTo("/admin/timeline", "Invalid request.", "error");

  await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
  revalidatePath("/timeline");
  backTo("/admin/timeline", "Timeline event deleted.");
}

export async function saveRuleSectionAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  const values = {
    title: requiredStr(formData, "title", "Untitled section"),
    body: requiredStr(formData, "body"),
    sortOrder: num(formData, "sortOrder") ?? 0,
    isPublished: bool(formData, "isPublished"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(ruleSections).set(values).where(eq(ruleSections.id, id));
  } else {
    await db.insert(ruleSections).values(values);
  }

  revalidatePath("/rules");
  backTo("/admin/timeline", id ? "Rule section updated." : "Rule section created.");
}

export async function deleteRuleSectionAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  if (!id) backTo("/admin/timeline", "Invalid request.", "error");

  await db.delete(ruleSections).where(eq(ruleSections.id, id));
  revalidatePath("/rules");
  backTo("/admin/timeline", "Rule section deleted.");
}

/* --------------------------- announcement actions ------------------------ */

export async function saveAnnouncementAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  const isPublished = bool(formData, "isPublished");
  const values = {
    title: requiredStr(formData, "title", "Untitled announcement"),
    body: requiredStr(formData, "body"),
    isPublished,
    isPinned: bool(formData, "isPinned"),
    publishedAt: isPublished ? new Date() : null,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(announcements).set(values).where(eq(announcements.id, id));
  } else {
    await db.insert(announcements).values(values);
  }

  revalidatePath("/");
  backTo("/admin/announcements", id ? "Announcement updated." : "Announcement created.");
}

export async function deleteAnnouncementAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  if (!id) backTo("/admin/announcements", "Invalid request.", "error");

  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath("/");
  backTo("/admin/announcements", "Announcement deleted.");
}

/* ------------------------------ result actions --------------------------- */

export async function saveResultAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  const isPublished = bool(formData, "isPublished");
  const values = {
    roundName: requiredStr(formData, "roundName", "Round"),
    title: requiredStr(formData, "title", "Untitled result"),
    summary: str(formData, "summary"),
    body: str(formData, "body"),
    teamId: num(formData, "teamId"),
    placement: str(formData, "placement"),
    isPublished,
    publishedAt: isPublished ? new Date() : null,
    sortOrder: num(formData, "sortOrder") ?? 0,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(results).set(values).where(eq(results.id, id));
  } else {
    await db.insert(results).values(values);
  }

  revalidatePath("/results");
  backTo("/admin/results", id ? "Result updated." : "Result created.");
}

export async function deleteResultAction(formData: FormData): Promise<void> {
  await guard("manage_content");
  const id = num(formData, "id");
  if (!id) backTo("/admin/results", "Invalid request.", "error");

  await db.delete(results).where(eq(results.id, id));
  revalidatePath("/results");
  backTo("/admin/results", "Result deleted.");
}

export async function toggleResultsPublishedAction(formData: FormData): Promise<void> {
  await guard("publish");
  const publish = bool(formData, "publish");

  await db
    .update(competitionSettings)
    .set({ resultsPublished: publish, updatedAt: new Date() })
    .where(eq(competitionSettings.id, 1));

  revalidatePath("/results");
  backTo("/admin/results", publish ? "Results page published." : "Results page hidden.");
}

/* --------------------------- notification actions ------------------------ */

export async function markNotificationSentAction(formData: FormData): Promise<void> {
  await guard("publish");
  const id = num(formData, "id");
  if (!id) backTo("/admin/final-16", "Invalid request.", "error");

  await db
    .update(notifications)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(notifications.id, id));

  backTo("/admin/final-16", "Notification marked as sent.");
}


