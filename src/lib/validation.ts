import { z } from "zod";

const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Normalises any incoming value (JSON body or FormData entry) to a trimmed string. */
export function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

export function asBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === 1 || value === "1";
}

/** Converts an empty optional string to null for database storage. */
export function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

const required = (min: number, max: number, message: string) =>
  z.string().min(min, message).max(max, "This value is too long");

const optional = (max: number) => z.string().max(max, "This value is too long");

const optionalUrl = (max: number) =>
  z
    .string()
    .max(max, "This link is too long")
    .refine((value) => value === "" || URL_RE.test(value), {
      message: "Enter a valid link starting with http:// or https://",
    });

/**
 * Every key is required at the schema level (the callers always supply a
 * normalised string) so optional-key semantics can never vary across runtimes.
 */
export const registrationSchema = z.object({
  displayName: required(2, 120, "Enter your name (at least 2 characters)"),
  editingUsername: required(2, 80, "Enter your editing username").regex(
    /^[\w .@-]+$/,
    "Username can contain letters, numbers, spaces and . _ - @",
  ),
  email: required(5, 200, "Enter a valid email address").regex(
    EMAIL_RE,
    "Enter a valid email address",
  ),
  submissionLink: required(5, 500, "Add your audition link").regex(
    URL_RE,
    "Enter a valid link starting with http:// or https://",
  ),
  youtubeHandle: optional(120),
  instagramUsername: optional(120),
  editingSoftware: optional(160),
  portfolioLink: optionalUrl(500),
  platform: z.enum(["", "pc", "mobile", "both"]),
  introduction: optional(1200),
  consent: z.boolean().refine((value) => value, {
    message: "You must confirm the competition rules",
  }),
});

export type RegistrationParsed = z.infer<typeof registrationSchema>;

export function buildRegistrationCandidate(payload: unknown) {
  const body = (typeof payload === "object" && payload !== null ? payload : {}) as Record<
    string,
    unknown
  >;
  const platform = asString(body.platform);
  return {
    displayName: asString(body.displayName),
    editingUsername: asString(body.editingUsername),
    email: asString(body.email).toLowerCase(),
    submissionLink: asString(body.submissionLink),
    youtubeHandle: asString(body.youtubeHandle),
    instagramUsername: asString(body.instagramUsername),
    editingSoftware: asString(body.editingSoftware),
    portfolioLink: asString(body.portfolioLink),
    platform: (["pc", "mobile", "both"].includes(platform) ? platform : "") as
      | ""
      | "pc"
      | "mobile"
      | "both",
    introduction: asString(body.introduction),
    consent: asBoolean(body.consent),
  };
}

export const contactSchema = z.object({
  name: required(2, 120, "Enter your name"),
  email: required(5, 200, "Enter a valid email address").regex(
    EMAIL_RE,
    "Enter a valid email address",
  ),
  subject: required(3, 200, "Enter a subject"),
  message: required(10, 4000, "Message must be at least 10 characters"),
});

export function buildContactCandidate(payload: unknown) {
  const body = (typeof payload === "object" && payload !== null ? payload : {}) as Record<
    string,
    unknown
  >;
  return {
    name: asString(body.name),
    email: asString(body.email).toLowerCase(),
    subject: asString(body.subject),
    message: asString(body.message),
  };
}

export const loginSchema = z.object({
  email: required(5, 200, "Enter a valid email address").regex(
    EMAIL_RE,
    "Enter a valid email address",
  ),
  password: required(1, 200, "Enter your password"),
});

export const setupSchema = z.object({
  name: required(2, 120, "Enter your name"),
  email: required(5, 200, "Enter a valid email address").regex(
    EMAIL_RE,
    "Enter a valid email address",
  ),
  password: required(10, 200, "Password must be at least 10 characters"),
  setupToken: optional(200),
});

export function flattenIssues(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
