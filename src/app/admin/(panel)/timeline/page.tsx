import { AdminHeader, Panel, adminInput, adminLabel } from "@/components/admin/ui";
import { Disclosure, SubmitButton } from "@/components/admin/client";
import {
  deleteRuleSectionAction,
  deleteTimelineEventAction,
  saveRuleSectionAction,
  saveTimelineEventAction,
} from "@/app/admin/actions";
import { computeNotificationWindow, formatDate, toDateInputValue } from "@/lib/competition";
import { getRuleSections, getSettings, getTimelineEvents } from "@/lib/data";
import type { RuleSection, TimelineEvent } from "@/db/schema";

export const dynamic = "force-dynamic";

function TimelineForm({ event }: { event?: TimelineEvent }) {
  return (
    <form action={saveTimelineEventAction} className="space-y-4">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={adminLabel}>Title</label>
          <input name="title" defaultValue={event?.title ?? ""} className={adminInput} required />
        </div>
        <div>
          <label className={adminLabel}>Phase key</label>
          <input
            name="phaseKey"
            defaultValue={event?.phaseKey ?? ""}
            placeholder="registration_opens"
            className={adminInput}
            required
          />
        </div>
      </div>
      <div>
        <label className={adminLabel}>Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={event?.description ?? ""}
          className={adminInput}
          placeholder="Optional context shown on the public timeline."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={adminLabel}>Date (blank = TBA)</label>
          <input
            name="eventDate"
            type="date"
            defaultValue={toDateInputValue(event?.eventDate)}
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Status</label>
          <select name="status" defaultValue={event?.status ?? "upcoming"} className={adminInput}>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className={adminLabel}>Order</label>
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={event?.sortOrder ?? 0}
            className={adminInput}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-xs text-mist/75">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={event?.isPublished ?? true}
            className="h-4 w-4 accent-[#a78bfa]"
          />
          Published
        </label>
        <SubmitButton size="sm">{event ? "Save event" : "Create event"}</SubmitButton>
      </div>
    </form>
  );
}

function RuleForm({ section }: { section?: RuleSection }) {
  return (
    <form action={saveRuleSectionAction} className="space-y-4">
      {section ? <input type="hidden" name="id" value={section.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <div>
          <label className={adminLabel}>Section title</label>
          <input name="title" defaultValue={section?.title ?? ""} className={adminInput} required />
        </div>
        <div>
          <label className={adminLabel}>Order</label>
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={section?.sortOrder ?? 0}
            className={adminInput}
          />
        </div>
      </div>
      <div>
        <label className={adminLabel}>Content</label>
        <textarea
          name="body"
          rows={5}
          defaultValue={section?.body ?? ""}
          className={adminInput}
          required
        />
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-xs text-mist/75">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={section?.isPublished ?? true}
            className="h-4 w-4 accent-[#a78bfa]"
          />
          Published
        </label>
        <SubmitButton size="sm">{section ? "Save section" : "Create section"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminTimelinePage() {
  const [settings, events, rules] = await Promise.all([
    getSettings(),
    getTimelineEvents(false),
    getRuleSections(false),
  ]);
  const notificationWindow = computeNotificationWindow(settings);

  return (
    <>
      <AdminHeader
        title="Timeline & rules"
        description={`Unset dates display as TBA on the public site. Notification deadline currently resolves to ${formatDate(notificationWindow.notificationDeadline)}.`}
      />

      <Panel title="Timeline events" description="Drag-free ordering via the order field.">
        <div className="space-y-3">
          {events.map((event) => (
            <Disclosure
              key={event.id}
              label={`${event.title} · ${formatDate(event.eventDate)}${event.isPublished ? "" : " · draft"}`}
            >
              <TimelineForm event={event} />
              <form action={deleteTimelineEventAction} className="mt-4 border-t border-white/8 pt-4">
                <input type="hidden" name="id" value={event.id} />
                <SubmitButton size="xs" variant="danger" confirm={`Delete “${event.title}”?`}>
                  Delete event
                </SubmitButton>
              </form>
            </Disclosure>
          ))}
        </div>
        <div className="mt-6 border-t border-white/8 pt-6">
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-mist/60">
            Add timeline event
          </h3>
          <TimelineForm />
        </div>
      </Panel>

      <div className="mt-6">
        <Panel title="Rulebook sections" description="Content shown on the public rules page.">
          <div className="space-y-3">
            {rules.map((section) => (
              <Disclosure
                key={section.id}
                label={`${section.title}${section.isPublished ? "" : " · draft"}`}
              >
                <RuleForm section={section} />
                <form
                  action={deleteRuleSectionAction}
                  className="mt-4 border-t border-white/8 pt-4"
                >
                  <input type="hidden" name="id" value={section.id} />
                  <SubmitButton size="xs" variant="danger" confirm={`Delete “${section.title}”?`}>
                    Delete section
                  </SubmitButton>
                </form>
              </Disclosure>
            ))}
          </div>
          <div className="mt-6 border-t border-white/8 pt-6">
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-mist/60">
              Add rule section
            </h3>
            <RuleForm />
          </div>
        </Panel>
      </div>
    </>
  );
}
