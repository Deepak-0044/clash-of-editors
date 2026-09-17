import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/data";
import { COMPETITION_STATUS_LABELS } from "@/lib/competition";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="relative flex min-h-screen flex-col bg-ink">
      <div className="pointer-events-none fixed inset-0 grid-backdrop opacity-60" aria-hidden />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(139,92,246,0.13),transparent_70%)]"
        aria-hidden
      />
      <SiteHeader statusLabel={COMPETITION_STATUS_LABELS[settings.status]} />
      <main className="relative z-10 flex-1 pt-18">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
