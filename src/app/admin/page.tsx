import { redirect } from "next/navigation";

import { adminCount, getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin/dashboard");

  const existing = await adminCount();
  if (existing === 0) redirect("/admin/setup");
  redirect("/admin/login");
}
