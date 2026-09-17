import type { CompetitionSettings } from "@/db/schema";

export const COMPETITION_STATUS_LABELS: Record<CompetitionSettings["status"], string> = {
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  auditions_under_review: "Auditions Under Review",
  selection_in_progress: "Selection in Progress",
  final_16_selected: "Final 16 Selected",
  team_formation: "Team Formation",
  competition_live: "Competition Live",
  results: "Results",
  competition_completed: "Competition Completed",
};

export const REGISTRATION_STATUS_LABELS = {
  pending_review: "Pending Review",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  selected: "Selected",
  not_selected: "Not Selected",
} as const;

export type RegistrationStatus = keyof typeof REGISTRATION_STATUS_LABELS;

export const PLATFORM_LABELS = {
  pc: "PC Editor",
  mobile: "Mobile Editor",
  both: "PC & Mobile",
} as const;

export const WORKFLOW_STEPS = [
  {
    key: "registration",
    title: "Registration",
    description: "Editors submit their details and audition link through the official form.",
  },
  {
    key: "audition_submission",
    title: "Audition Submission",
    description: "Each editor submits one audition edit for organizer review.",
  },
  {
    key: "audition_review",
    title: "Audition Review",
    description: "Organizers manually review creativity, effort, cleanliness and overall quality.",
  },
  {
    key: "final_16",
    title: "Final 16 Selection",
    description: "Exactly sixteen editors are manually selected by the organizing team.",
  },
  {
    key: "notification",
    title: "Selection Notification",
    description: "Selected editors are notified within the official notification window.",
  },
  {
    key: "team_formation",
    title: "Leader Team Formation",
    description: "Four leaders manually build their rosters from the Final 16.",
  },
  {
    key: "competition",
    title: "Competition",
    description: "Teams clash across rounds judged on editing craft and execution.",
  },
  {
    key: "results",
    title: "Results",
    description: "Round and final results are published by the organizing team.",
  },
] as const;

export const DEFAULT_TIMELINE_PHASES = [
  { phaseKey: "registration_opens", title: "Registration Opens" },
  { phaseKey: "registration_closes", title: "Registration Closes" },
  { phaseKey: "audition_review", title: "Audition Review" },
  { phaseKey: "final_16_selection", title: "Final 16 Selection" },
  { phaseKey: "notification_deadline", title: "Selection Notification Deadline" },
  { phaseKey: "team_formation", title: "Team Formation" },
  { phaseKey: "competition_start", title: "Competition Start" },
  { phaseKey: "competition_rounds", title: "Competition Rounds" },
  { phaseKey: "final_results", title: "Final Results" },
] as const;

export const TBA = "TBA";

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return TBA;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return TBA;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return TBA;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return TBA;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export type NotificationState =
  | "not_configured"
  | "registration_scheduled"
  | "registration_open"
  | "review_period_active"
  | "deadline_approaching"
  | "deadline_passed";

export type NotificationWindow = {
  state: NotificationState;
  label: string;
  detail: string;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  notificationDeadline: Date | null;
  daysRemaining: number | null;
  windowDays: number;
};

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * The 20-day countdown starts when the official registration period closes —
 * never per participant. Notification deadline = registration close + N days.
 */
export function computeNotificationWindow(
  settings: Pick<
    CompetitionSettings,
    "registrationOpensAt" | "registrationClosesAt" | "notificationWindowDays"
  >,
  now: Date = new Date(),
): NotificationWindow {
  const windowDays = settings.notificationWindowDays ?? 20;
  const opensAt = settings.registrationOpensAt ? new Date(settings.registrationOpensAt) : null;
  const closesAt = settings.registrationClosesAt ? new Date(settings.registrationClosesAt) : null;

  if (!closesAt) {
    return {
      state: "not_configured",
      label: "Notification deadline: TBA",
      detail:
        "The registration closing date has not been configured yet, so the notification deadline is TBA.",
      registrationOpensAt: opensAt,
      registrationClosesAt: null,
      notificationDeadline: null,
      daysRemaining: null,
      windowDays,
    };
  }

  const deadline = new Date(closesAt.getTime() + windowDays * DAY_MS);
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / DAY_MS);

  if (opensAt && now < opensAt) {
    return {
      state: "registration_scheduled",
      label: "Registration opens soon",
      detail: `Registration opens ${formatDate(opensAt)}. Selected editors will be notified by ${formatDate(deadline)}.`,
      registrationOpensAt: opensAt,
      registrationClosesAt: closesAt,
      notificationDeadline: deadline,
      daysRemaining,
      windowDays,
    };
  }

  if (now < closesAt) {
    return {
      state: "registration_open",
      label: "Registration open",
      detail: `Registration closes ${formatDate(closesAt)}. All selected editors will be notified within ${windowDays} days of closing — by ${formatDate(deadline)}.`,
      registrationOpensAt: opensAt,
      registrationClosesAt: closesAt,
      notificationDeadline: deadline,
      daysRemaining,
      windowDays,
    };
  }

  if (daysRemaining < 0) {
    return {
      state: "deadline_passed",
      label: "Notification deadline passed",
      detail: `The ${windowDays}-day notification deadline (${formatDate(deadline)}) has passed.`,
      registrationOpensAt: opensAt,
      registrationClosesAt: closesAt,
      notificationDeadline: deadline,
      daysRemaining,
      windowDays,
    };
  }

  if (daysRemaining <= 5) {
    return {
      state: "deadline_approaching",
      label: "Notification deadline approaching",
      detail: `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining until the notification deadline on ${formatDate(deadline)}.`,
      registrationOpensAt: opensAt,
      registrationClosesAt: closesAt,
      notificationDeadline: deadline,
      daysRemaining,
      windowDays,
    };
  }

  return {
    state: "review_period_active",
    label: "Review period active",
    detail: `Registration closed ${formatDate(closesAt)}. Selected editors will be notified by ${formatDate(deadline)} — ${daysRemaining} days remaining.`,
    registrationOpensAt: opensAt,
    registrationClosesAt: closesAt,
    notificationDeadline: deadline,
    daysRemaining,
    windowDays,
  };
}
