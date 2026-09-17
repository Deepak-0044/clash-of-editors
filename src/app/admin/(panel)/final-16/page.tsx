import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { ExternalLink, Lock, Unlock } from "lucide-react";

import { db } from "@/db";
import { evaluations, notifications, registrations } from "@/db/schema";
import { AdminHeader, MetricCard, Panel, StatusTag, TableWrap, Td, Th } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/client";
import {
  publishFinal16Action,
  markNotificationSentAction,
  updateRegistrationStatusAction,
} from "@/app/admin/actions";
import { computeNotificationWindow, formatDate, formatDateTime } from "@/lib/competition";
import { getRegistrationStats, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Final16Page() {
  const settings = await getSettings();
  const stats = await getRegistrationStats();
  const notificationWindow = computeNotificationWindow(settings);

  const candidates = await db
    .select({
      id: registrations.id,
      displayName: registrations.displayName,
      editingUsername: registrations.editingUsername,
      submissionLink: registrations.submissionLink,
      status: registrations.status,
      platform: registrations.platform,
      creativity: evaluations.creativity,
      effort: evaluations.effort,
      cleanliness: evaluations.cleanliness,
      overallQuality: evaluations.overallQuality,
      notes: evaluations.reviewerNotes,
    })
    .from(registrations)
    .leftJoin(evaluations, eq(evaluations.registrationId, registrations.id))
    .where(
      and(
        eq(registrations.isDeleted, false),
        inArray(registrations.status, ["shortlisted", "selected", "under_review"]),
      ),
    )
    .orderBy(desc(registrations.status), desc(registrations.updatedAt));

  const queuedNotifications = await db
    .select({
      id: notifications.id,
      subject: notifications.subject,
      status: notifications.status,
      createdAt: notifications.createdAt,
      registrationId: notifications.registrationId,
    })
    .from(notifications)
    .orderBy(desc(notifications.id))
    .limit(20);

  const remaining = settings.editorSlots - stats.selected;

  return (
    <>
      <AdminHeader
        title="Final 16 selection"
        description="Manual selection only. The roster stays private until you publish it."
        actions={
          <form action={publishFinal16Action}>
            <input type="hidden" name="publish" value={settings.final16Published ? "0" : "1"} />
            <SubmitButton
              size="md"
              variant={settings.final16Published ? "danger" : "primary"}
              confirm={
                settings.final16Published
                  ? "Unpublish the Final 16? The public editors page will hide the roster again."
                  : `Publish the Final 16? ${stats.selected} selected editors will become public.`
              }
            >
              {settings.final16Published ? (
                <>
                  <Unlock size={13} /> Unpublish Final 16
                </>
              ) : (
                <>
                  <Lock size={13} /> Publish Final 16
                </>
              )}
            </SubmitButton>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Selected editors"
          value={`${stats.selected} / ${settings.editorSlots}`}
          tone="gold"
          hint={remaining > 0 ? `${remaining} slots remaining` : "Roster full"}
        />
        <MetricCard label="Shortlisted" value={stats.shortlisted} tone="amber" />
        <MetricCard label="Under review" value={stats.underReview} />
        <MetricCard
          label="Notification deadline"
          value={formatDate(notificationWindow.notificationDeadline)}
          tone={notificationWindow.state === "deadline_passed" ? "red" : "neutral"}
          hint={
            notificationWindow.daysRemaining === null
              ? "Closing date not configured"
              : `${Math.max(notificationWindow.daysRemaining, 0)} days remaining`
          }
        />
      </div>

      <div className="mt-6">
        <Panel
          title="Selection pool"
          description="Editors under review, shortlisted or already selected. Only selected editors count towards the roster limit."
        >
          {candidates.length === 0 ? (
            <p className="py-10 text-center text-sm text-mist/55">
              No candidates yet. Move participants to “Under review” or “Shortlisted” from the
              registrations table.
            </p>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Editor</Th>
                  <Th>Scores (C / E / Cl / Q)</Th>
                  <Th>Status</Th>
                  <Th>Audition</Th>
                  <Th className="text-right">Decision</Th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <Td>
                      <Link
                        href={`/admin/registrations/${candidate.id}`}
                        className="font-medium text-white hover:text-gold"
                      >
                        {candidate.displayName}
                      </Link>
                      <span className="block text-xs text-mist/50">
                        @{candidate.editingUsername}
                      </span>
                    </Td>
                    <Td className="text-xs text-mist/60">
                      {[
                        candidate.creativity,
                        candidate.effort,
                        candidate.cleanliness,
                        candidate.overallQuality,
                      ]
                        .map((value) => (value === null ? "—" : value))
                        .join(" / ")}
                    </Td>
                    <Td>
                      <StatusTag status={candidate.status} />
                    </Td>
                    <Td>
                      <a
                        href={candidate.submissionLink}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-bright"
                      >
                        Open <ExternalLink size={12} />
                      </a>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap justify-end gap-2">
                        {(["shortlisted", "selected", "not_selected"] as const).map((status) => (
                          <form key={status} action={updateRegistrationStatusAction}>
                            <input type="hidden" name="id" value={candidate.id} />
                            <input type="hidden" name="status" value={status} />
                            <input type="hidden" name="returnTo" value="/admin/final-16" />
                            <SubmitButton
                              size="xs"
                              variant={
                                candidate.status === status
                                  ? "primary"
                                  : status === "not_selected"
                                    ? "danger"
                                    : "subtle"
                              }
                            >
                              {status === "shortlisted"
                                ? "Shortlist"
                                : status === "selected"
                                  ? "Select"
                                  : "Reject"}
                            </SubmitButton>
                          </form>
                        ))}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
      </div>

      <div className="mt-6">
        <Panel
          title="Selection notifications"
          description="A notification record is queued for each selected editor when the Final 16 is published. Mark them as sent once you have contacted the editor."
        >
          {queuedNotifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-mist/55">
              No notifications queued yet.
            </p>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Subject</Th>
                  <Th>Participant</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {queuedNotifications.map((item) => (
                  <tr key={item.id}>
                    <Td className="text-white">{item.subject}</Td>
                    <Td className="text-xs text-mist/60">#{item.registrationId}</Td>
                    <Td className="text-xs uppercase tracking-[0.14em] text-mist/70">
                      {item.status}
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-mist/55">
                      {formatDateTime(item.createdAt)}
                    </Td>
                    <Td className="text-right">
                      {item.status === "queued" ? (
                        <form action={markNotificationSentAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <SubmitButton size="xs" variant="subtle">
                            Mark sent
                          </SubmitButton>
                        </form>
                      ) : (
                        <span className="text-[11px] text-mist/45">Done</span>
                      )}
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
