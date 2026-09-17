import { randomBytes, createHash, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, count } from "drizzle-orm";

import { db } from "@/db";
import { adminSessions, adminUsers, type AdminUser } from "@/db/schema";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

export const SESSION_COOKIE = "coe_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

/* ----------------------------- passwords ----------------------------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const derived = await scrypt(password, salt, expected.length);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

/* ------------------------------ sessions ----------------------------- */

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminId: number, userAgent?: string | null) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(adminSessions).values({
    adminId,
    tokenHash: hashToken(token),
    expiresAt,
    userAgent: userAgent?.slice(0, 280) ?? null,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)));
  }
  jar.delete(SESSION_COOKIE);
}

export type SessionUser = Pick<AdminUser, "id" | "name" | "email" | "role">;

export async function getCurrentAdmin(): Promise<SessionUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const rows = await db
      .select({
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
      })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.adminId))
      .where(
        and(eq(adminSessions.tokenHash, hashToken(token)), gt(adminSessions.expiresAt, new Date())),
      )
      .limit(1);

    const row = rows[0];
    if (!row || !row.isActive) return null;
    return { id: row.id, name: row.name, email: row.email, role: row.role };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function adminCount(): Promise<number> {
  try {
    const rows = await db.select({ value: count() }).from(adminUsers);
    return rows[0]?.value ?? 0;
  } catch {
    return -1; // database unavailable
  }
}

/* ---------------------------- authorization --------------------------- */

export type Permission =
  | "manage_admins"
  | "manage_content"
  | "manage_selection"
  | "publish"
  | "evaluate"
  | "view_registrations";

const ROLE_PERMISSIONS: Record<AdminUser["role"], Permission[]> = {
  owner: [
    "manage_admins",
    "manage_content",
    "manage_selection",
    "publish",
    "evaluate",
    "view_registrations",
  ],
  organizer: ["manage_content", "manage_selection", "publish", "evaluate", "view_registrations"],
  reviewer: ["evaluate", "view_registrations"],
};

export function can(role: AdminUser["role"], permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const admin = await requireAdmin();
  if (!can(admin.role, permission)) {
    throw new Error("You do not have permission to perform this action.");
  }
  return admin;
}
