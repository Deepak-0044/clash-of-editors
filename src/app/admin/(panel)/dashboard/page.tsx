import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowUpRight, Inbox } from "lucide-react";

import { db } from "@/db";
import { contactMessages, registrations } from "@/db/schema";
import { AdminHeader, MetricCard, Panel, StatusTag, TableWrap, Td, Th } from "@/components/admin/ui";
import {
  COMPETITION_STATUS_LABELS,
  computeNotificationWindow,
  formatDate,
  formatDateTime,
} from "@/lib/competition";
import { getRegistrationStats, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const settings = await getSettings();
  const stats = await getRegistrationStats();
  const notificationWindow = computeNotificationWindow(settings);

  const recent = await db
    .select({
      id: registrations.id,
      displayName: registrations.displayName,
      editingUsername: registrations.editingUsername,
      status: registrations.status,
      createdAt: registrations.createdAt,
    })
    .from(registrations)
    .where(eq(registrations.isDeleted, false))
    .orderBy(desc(registrations.createdAt))
    .limit(8);

  const messages = await db
    .select({ id: contactMessages.id })
    .from(contactMessages)
    .where(eq(contactMessages.isHandled, false));

  return (
    <>
      <AdminHeader
        title="Overview"
        description="Live competition data from the database. Every number here reflects real registrations and organizer decisions."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total registrations" value={stats.total} />
        <MetricCard label="Pending review" value={stats.pending} tone="amber" />
        <MetricCard label="Under review" value={stats.underReview} />
        <MetricCard label="Shortlisted" value={stats.shortlisted} tone="amber" />
        <MetricCard
          label="Selected"
          value={`${stats.selected} / ${settings.editorSlots}`}
          tone="gold"
          hint={settings.final16Published ? "Final 16 published" : "Final 16 private"}
        />
        <MetricCard label="Not selected" value={stats.notSelected} tone="red" />
        <MetricCard
          label="Unread messages"
          value={messages.length}
          hint="Contact form submissions"
        />
        <MetricCard
          label="Competition status"
          value={COMPETITION_STATUS_LABELS[settings.status]}
          tone="gold"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="20-day notification rule"
          description="Deadline = registration closing date + configured window."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Registration closes"
              value={formatDate(settings.registrationClosesAt)}
            />
            <MetricCard
              label="Notification deadline"
              value={formatDate(notificationWindow.notificationDeadline)}
              tone="gold"
            />
            <MetricCard
              label="Days remaining"
              value={
                notificationWindow.daysRemaining === null
                  ? "TBA"
                  : Math.max(notificationWindow.daysRemaining, 0)
              }
              tone={
                notificationWindow.state === "deadline_passed"
                  ? "red"
                  : notificationWindow.state === "deadline_approaching"
                    ? "amber"
                    : "neutral"
              }
            />
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-mist/65">
            {notificationWindow.detail}
          </p>
          <Link
            href="/admin/settings"
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold hover:text-gold-bright"
          >
            Configure dates
            <ArrowUpRight size={13} />
          </Link>
        </Panel>

        <Panel title="Publication state">
          <ul className="space-y-3 text-sm">
            {[
              { label: "Registration form", value: settings.registrationFormOpen ? "Open" : "Closed" },
              { label: "Final 16", value: settings.final16Published ? "Published" : "Private" },
              { label: "Team assignments", value: settings.teamsPublished ? "Published" : "Hidden" },
              { label: "Results page", value: settings.resultsPublished ? "Published" : "Hidden" },
              { label: "Season", value: settings.seasonLabel },
            ].map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3 border-b border-white/6 pb-2.5 last:border-0"
              >
                <span className="text-mist/60">{row.label}</span>
                <span className="font-semibold text-white">{row.value}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel
          title="Latest registrations"
          actions={
            <Link
              href="/admin/registrations"
              className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold hover:text-gold-bright"
            >
              View all
            </Link>
          }
        >
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Inbox size={26} className="text-mist/35" />
              <p className="text-sm text-mist/55">
                No registrations yet. Entries appear here as soon as editors submit the form.
              </p>
            </div>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Editor</Th>
                  <Th>Username</Th>
                  <Th>Status</Th>
                  <Th>Submitted</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id}>
                    <Td className="font-medium text-white">{row.displayName}</Td>
                    <Td>{row.editingUsername}</Td>
                    <Td>
                      <StatusTag status={row.status} />
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-mist/55">
                      {formatDateTime(row.createdAt)}
                    </Td>
                    <Td className="text-right">
                      <Link
                        href={`/admin/registrations/${row.id}`}
                        className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-bright"
                      >
                        Review
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
      </div>
    </>
  );
}
