import { AdminHeader, Panel, adminInput, adminLabel } from "@/components/admin/ui";
import { Disclosure, SubmitButton } from "@/components/admin/client";
import { deleteAnnouncementAction, saveAnnouncementAction } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/competition";
import { getAllAnnouncements } from "@/lib/data";
import type { Announcement } from "@/db/schema";

export const dynamic = "force-dynamic";

function AnnouncementForm({ item }: { item?: Announcement }) {
  return (
    <form action={saveAnnouncementAction} className="space-y-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div>
        <label className={adminLabel}>Title</label>
        <input name="title" defaultValue={item?.title ?? ""} className={adminInput} required />
      </div>
      <div>
        <label className={adminLabel}>Content</label>
        <textarea
          name="body"
          rows={5}
          defaultValue={item?.body ?? ""}
          className={adminInput}
          required
        />
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-xs text-mist/75">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={item?.isPublished ?? false}
            className="h-4 w-4 accent-[#a78bfa]"
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-xs text-mist/75">
          <input
            type="checkbox"
            name="isPinned"
            defaultChecked={item?.isPinned ?? false}
            className="h-4 w-4 accent-[#a78bfa]"
          />
          Pinned
        </label>
        <SubmitButton size="sm">{item ? "Save announcement" : "Create announcement"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminAnnouncementsPage() {
  const items = await getAllAnnouncements();
  const published = items.filter((item) => item.isPublished).length;

  return (
    <>
      <AdminHeader
        title="Announcements"
        description={`${published} published of ${items.length} total. Only published announcements appear on the public site.`}
      />

      <Panel title="Existing announcements">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-mist/55">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Disclosure
                key={item.id}
                label={`${item.title} · ${item.isPublished ? formatDateTime(item.publishedAt ?? item.createdAt) : "draft"}`}
              >
                <AnnouncementForm item={item} />
                <form
                  action={deleteAnnouncementAction}
                  className="mt-4 border-t border-white/8 pt-4"
                >
                  <input type="hidden" name="id" value={item.id} />
                  <SubmitButton size="xs" variant="danger" confirm={`Delete “${item.title}”?`}>
                    Delete announcement
                  </SubmitButton>
                </form>
              </Disclosure>
            ))}
          </div>
        )}
      </Panel>

      <div className="mt-6">
        <Panel title="New announcement">
          <AnnouncementForm />
        </Panel>
      </div>
    </>
  );
}
