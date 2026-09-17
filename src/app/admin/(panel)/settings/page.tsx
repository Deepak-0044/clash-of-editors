import { desc } from "drizzle-orm";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { AdminHeader, Panel, adminInput, adminLabel } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/client";
import { updateSettingsAction } from "@/app/admin/actions";
import {
  COMPETITION_STATUS_LABELS,
  computeNotificationWindow,
  formatDate,
  formatDateTime,
  toDateInputValue,
} from "@/lib/competition";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const notificationWindow = computeNotificationWindow(settings);

  const messages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(10);

  return (
    <>
      <AdminHeader
        title="Competition settings"
        description={`Notification deadline resolves to ${formatDate(notificationWindow.notificationDeadline)} — ${notificationWindow.detail}`}
      />

      <Panel title="Competition configuration">
        <form action={updateSettingsAction} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={adminLabel}>Competition status</label>
              <select name="status" defaultValue={settings.status} className={adminInput}>
                {Object.entries(COMPETITION_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={adminLabel}>Season label</label>
              <input name="seasonLabel" defaultValue={settings.seasonLabel} className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Notification window (days)</label>
              <input
                name="notificationWindowDays"
                type="number"
                min={1}
                max={120}
                defaultValue={settings.notificationWindowDays}
                className={adminInput}
              />
            </div>
            <div>
              <label className={adminLabel}>Registration opens</label>
              <input
                name="registrationOpensAt"
                type="date"
                defaultValue={toDateInputValue(settings.registrationOpensAt)}
                className={adminInput}
              />
            </div>
            <div>
              <label className={adminLabel}>Registration closes</label>
              <input
                name="registrationClosesAt"
                type="date"
                defaultValue={toDateInputValue(settings.registrationClosesAt)}
                className={adminInput}
              />
            </div>
            <div>
              <label className={adminLabel}>Default team capacity</label>
              <input
                name="defaultTeamCapacity"
                type="number"
                min={1}
                max={16}
                defaultValue={settings.defaultTeamCapacity}
                className={adminInput}
              />
            </div>
            <div>
              <label className={adminLabel}>Leader slots</label>
              <input
                name="leaderSlots"
                type="number"
                min={1}
                max={12}
                defaultValue={settings.leaderSlots}
                className={adminInput}
              />
            </div>
            <div>
              <label className={adminLabel}>Editor slots (Final roster)</label>
              <input
                name="editorSlots"
                type="number"
                min={1}
                max={64}
                defaultValue={settings.editorSlots}
                className={adminInput}
              />
            </div>
            <div>
              <label className={adminLabel}>Auditions per editor</label>
              <input
                name="auditionCount"
                type="number"
                min={1}
                max={10}
                defaultValue={settings.auditionCount}
                className={adminInput}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <label className="flex items-center gap-2 text-xs text-mist/75">
              <input
                type="checkbox"
                name="registrationFormOpen"
                defaultChecked={settings.registrationFormOpen}
                className="h-4 w-4 accent-[#a78bfa]"
              />
              Registration form accepting entries
            </label>
            <label className="flex items-center gap-2 text-xs text-mist/75">
              <input
                type="checkbox"
                name="resultsPublished"
                defaultChecked={settings.resultsPublished}
                className="h-4 w-4 accent-[#a78bfa]"
              />
              Results page published
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabel}>Results placeholder text</label>
              <input
                name="resultsPlaceholderText"
                defaultValue={settings.resultsPlaceholderText}
                className={adminInput}
              />
            </div>
            <div>
              <label className={adminLabel}>Contact email</label>
              <input
                name="contactEmail"
                type="email"
                defaultValue={settings.contactEmail}
                className={adminInput}
                placeholder="organizers@example.com"
              />
            </div>
            <div>
              <label className={adminLabel}>Discord invite URL</label>
              <input
                name="contactDiscord"
                defaultValue={settings.contactDiscord}
                className={adminInput}
                placeholder="https://discord.gg/…"
              />
            </div>
            <div>
              <label className={adminLabel}>Instagram URL</label>
              <input
                name="contactInstagram"
                defaultValue={settings.contactInstagram}
                className={adminInput}
                placeholder="https://instagram.com/…"
              />
            </div>
            <div>
              <label className={adminLabel}>YouTube URL</label>
              <input
                name="contactYoutube"
                defaultValue={settings.contactYoutube}
                className={adminInput}
                placeholder="https://youtube.com/@…"
              />
            </div>
          </div>

          <div>
            <label className={adminLabel}>About intro (homepage & about page)</label>
            <textarea
              name="aboutIntro"
              rows={4}
              defaultValue={settings.aboutIntro}
              className={adminInput}
              placeholder="Leave blank to use the default description."
            />
          </div>

          <SubmitButton size="md">Save settings</SubmitButton>
        </form>
      </Panel>

      <div className="mt-6">
        <Panel title="Contact messages" description="Latest 10 messages from the public contact form.">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-mist/55">No messages yet.</p>
          ) : (
            <ul className="space-y-3">
              {messages.map((message) => (
                <li key={message.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{message.subject}</span>
                    <span className="text-[11px] uppercase tracking-[0.16em] text-mist/45">
                      {formatDateTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-mist/55">
                    {message.name} · {message.email}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-mist/75">
                    {message.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
