import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { db } from "@/db";
import { evaluations, registrations } from "@/db/schema";
import {
  AdminHeader,
  Panel,
  StatusTag,
  adminInput,
  adminLabel,
} from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/client";
import {
  PLATFORM_LABELS,
  REGISTRATION_STATUS_LABELS,
  formatDateTime,
} from "@/lib/competition";
import {
  saveEvaluationAction,
  softDeleteRegistrationAction,
  updateRegistrationStatusAction,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const SCORES = [
  { name: "creativity", label: "Creativity" },
  { name: "effort", label: "Effort" },
  { name: "cleanliness", label: "Cleanliness" },
  { name: "overallQuality", label: "Overall edit quality" },
] as const;

export default async function EvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const registrationId = Number(id);
  if (!Number.isFinite(registrationId)) notFound();

  const rows = await db
    .select({ registration: registrations, evaluation: evaluations })
    .from(registrations)
    .leftJoin(evaluations, eq(evaluations.registrationId, registrations.id))
    .where(eq(registrations.id, registrationId))
    .limit(1);

  const row = rows[0];
  if (!row) notFound();

  const { registration, evaluation } = row;

  return (
    <>
      <Link
        href="/admin/registrations"
        className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-mist/60 hover:text-white"
      >
        <ArrowLeft size={13} />
        All registrations
      </Link>

      <AdminHeader
        title={registration.displayName}
        description={`@${registration.editingUsername} · registered ${formatDateTime(registration.createdAt)}`}
        actions={<StatusTag status={registration.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-6">
          <Panel title="Evaluation" description="Internal reference only — scores never auto-select.">
            <form action={saveEvaluationAction} className="space-y-5">
              <input type="hidden" name="registrationId" value={registration.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                {SCORES.map((score) => (
                  <div key={score.name}>
                    <label htmlFor={score.name} className={adminLabel}>
                      {score.label} (0–10)
                    </label>
                    <input
                      id={score.name}
                      name={score.name}
                      type="number"
                      min={0}
                      max={10}
                      step={1}
                      defaultValue={evaluation?.[score.name] ?? ""}
                      className={adminInput}
                      placeholder="—"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="reviewerNotes" className={adminLabel}>
                  Internal reviewer notes
                </label>
                <textarea
                  id="reviewerNotes"
                  name="reviewerNotes"
                  rows={5}
                  defaultValue={evaluation?.reviewerNotes ?? ""}
                  className={adminInput}
                  placeholder="Private notes — never shown publicly."
                />
              </div>

              <div>
                <label htmlFor="internalNotes" className={adminLabel}>
                  Organizer notes on participant
                </label>
                <textarea
                  id="internalNotes"
                  name="internalNotes"
                  rows={3}
                  defaultValue={registration.internalNotes ?? ""}
                  className={adminInput}
                  placeholder="Logistics, communication history, follow-ups…"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <SubmitButton size="md">Save evaluation</SubmitButton>
                {evaluation?.updatedAt ? (
                  <span className="text-[11px] uppercase tracking-[0.16em] text-mist/45">
                    Last updated {formatDateTime(evaluation.updatedAt)}
                  </span>
                ) : null}
              </div>
            </form>
          </Panel>

          <Panel title="Review status" description="Manual decision by the organizing team.">
            <form action={updateRegistrationStatusAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={registration.id} />
              <input
                type="hidden"
                name="returnTo"
                value={`/admin/registrations/${registration.id}`}
              />
              <div className="min-w-[220px] flex-1">
                <label htmlFor="status" className={adminLabel}>
                  Participant status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={registration.status}
                  className={adminInput}
                >
                  {Object.entries(REGISTRATION_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <SubmitButton size="md" variant="outline">
                Update status
              </SubmitButton>
            </form>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Audition submission">
            <a
              href={registration.submissionLink}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 break-all rounded-lg border border-gold/35 px-4 py-3 text-[12px] font-semibold text-gold transition hover:bg-gold/10"
            >
              <ExternalLink size={14} />
              Open audition link
            </a>
            <p className="mt-3 break-all text-xs text-mist/45">{registration.submissionLink}</p>
          </Panel>

          <Panel title="Participant details">
            <dl className="space-y-3 text-sm">
              {[
                { label: "Gmail (private)", value: registration.email },
                { label: "Editing username", value: registration.editingUsername },
                {
                  label: "Platform",
                  value: registration.platform ? PLATFORM_LABELS[registration.platform] : "—",
                },
                { label: "Editing software", value: registration.editingSoftware ?? "—" },
                { label: "YouTube", value: registration.youtubeHandle ?? "—" },
                { label: "Instagram", value: registration.instagramUsername ?? "—" },
                { label: "Portfolio", value: registration.portfolioLink ?? "—" },
                {
                  label: "Status updated",
                  value: registration.statusUpdatedAt
                    ? formatDateTime(registration.statusUpdatedAt)
                    : "—",
                },
              ].map((item) => (
                <div key={item.label} className="border-b border-white/6 pb-2.5 last:border-0">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist/45">
                    {item.label}
                  </dt>
                  <dd className="mt-1 break-all text-mist/85">{item.value}</dd>
                </div>
              ))}
            </dl>
            {registration.introduction ? (
              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist/45">
                  Introduction
                </p>
                <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-mist/75">
                  {registration.introduction}
                </p>
              </div>
            ) : null}
          </Panel>

          <Panel title="Danger zone">
            <form action={softDeleteRegistrationAction}>
              <input type="hidden" name="id" value={registration.id} />
              <SubmitButton
                variant="danger"
                size="sm"
                confirm="Archive this registration? It will be hidden from all lists and team assignments."
              >
                Archive registration
              </SubmitButton>
            </form>
            <p className="mt-3 text-xs text-mist/45">
              Archiving is a soft delete — the record stays in the database for auditing.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
