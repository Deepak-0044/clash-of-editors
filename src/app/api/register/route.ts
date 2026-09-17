import { NextResponse } from "next/server";
import { and, eq, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { registrations } from "@/db/schema";
import { getSettings } from "@/lib/data";
import {
  buildRegistrationCandidate,
  flattenIssues,
  orNull,
  registrationSchema,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const settings = await getSettings();
  if (!settings.registrationFormOpen || settings.status !== "registration_open") {
    return NextResponse.json(
      { ok: false, message: "Registration is currently closed." },
      { status: 403 },
    );
  }

  if (settings.registrationClosesAt && new Date() > new Date(settings.registrationClosesAt)) {
    return NextResponse.json(
      { ok: false, message: "The registration period has ended." },
      { status: 403 },
    );
  }

  const parsed = registrationSchema.safeParse(buildRegistrationCandidate(payload));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: flattenIssues(parsed.error), message: "Please fix the errors below." },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const username = data.editingUsername;

  try {
    const existing = await db
      .select({ id: registrations.id, email: registrations.email })
      .from(registrations)
      .where(
        and(
          eq(registrations.isDeleted, false),
          or(
            eq(registrations.email, email),
            sql`lower(${registrations.editingUsername}) = ${username.toLowerCase()}`,
          ),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      const duplicateEmail = existing[0].email === email;
      return NextResponse.json(
        {
          ok: false,
          errors: duplicateEmail
            ? { email: "This email address has already been registered." }
            : { editingUsername: "This editing username has already been registered." },
          message: "A registration with these details already exists.",
        },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(registrations)
      .values({
        displayName: data.displayName,
        editingUsername: username,
        email,
        submissionLink: data.submissionLink,
        youtubeHandle: orNull(data.youtubeHandle),
        instagramUsername: orNull(data.instagramUsername),
        editingSoftware: orNull(data.editingSoftware),
        portfolioLink: orNull(data.portfolioLink),
        introduction: orNull(data.introduction),
        platform: data.platform === "" ? null : data.platform,
        status: "pending_review",
      })
      .returning({ id: registrations.id, editingUsername: registrations.editingUsername });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Registration submitted successfully. Your audition will now be reviewed by the Clash of Editors organizing team.",
        registration: created,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("unique") || message.includes("duplicate key")) {
      return NextResponse.json(
        {
          ok: false,
          errors: { email: "This email or username has already been registered." },
          message: "A registration with these details already exists.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, message: "We could not store your registration. Please try again shortly." },
      { status: 500 },
    );
  }
}
