import { NextResponse } from "next/server";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { buildContactCandidate, contactSchema, flattenIssues } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(buildContactCandidate(payload));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: flattenIssues(parsed.error), message: "Please fix the errors below." },
      { status: 422 },
    );
  }

  try {
    await db.insert(contactMessages).values({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
    return NextResponse.json({ ok: true, message: "Message received." }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, message: "We could not send your message. Please try again shortly." },
      { status: 500 },
    );
  }
}
