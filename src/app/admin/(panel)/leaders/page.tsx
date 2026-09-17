import { AdminHeader, Panel, adminInput, adminLabel } from "@/components/admin/ui";
import { Disclosure, SubmitButton } from "@/components/admin/client";
import { deleteLeaderAction, saveLeaderAction } from "@/app/admin/actions";
import { getAllLeaders, getSettings } from "@/lib/data";
import type { Leader } from "@/db/schema";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

function LeaderForm({ leader }: { leader?: Leader }) {
  return (
    <form action={saveLeaderAction} className="space-y-4">
      {leader ? <input type="hidden" name="id" value={leader.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={adminLabel}>Username</label>
          <input
            name="username"
            defaultValue={leader?.username ?? ""}
            placeholder="TBA"
            className={adminInput}
            required
          />
        </div>
        <div>
          <label className={adminLabel}>Platform</label>
          <select name="platform" defaultValue={leader?.platform ?? "pc"} className={adminInput}>
            <option value="pc">PC editor</option>
            <option value="mobile">Mobile editor</option>
            <option value="both">PC &amp; Mobile</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={adminLabel}>Editing style</label>
          <input
            name="editingStyle"
            defaultValue={leader?.editingStyle ?? ""}
            placeholder="e.g. Typography · Smooth flow"
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Profile image URL</label>
          <input
            name="imageUrl"
            defaultValue={leader?.imageUrl ?? ""}
            placeholder="https://…"
            className={adminInput}
          />
        </div>
      </div>

      <div>
        <label className={adminLabel}>Biography</label>
        <textarea
          name="biography"
          rows={4}
          defaultValue={leader?.biography ?? ""}
          placeholder="Short biography published on the public leaders page."
          className={adminInput}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={adminLabel}>YouTube URL</label>
          <input name="youtubeUrl" defaultValue={leader?.youtubeUrl ?? ""} className={adminInput} />
        </div>
        <div>
          <label className={adminLabel}>Instagram URL</label>
          <input
            name="instagramUrl"
            defaultValue={leader?.instagramUrl ?? ""}
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Other profile URL</label>
          <input name="xUrl" defaultValue={leader?.xUrl ?? ""} className={adminInput} />
        </div>
        <div>
          <label className={adminLabel}>Discord handle</label>
          <input
            name="discordHandle"
            defaultValue={leader?.discordHandle ?? ""}
            className={adminInput}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-5">
        <div className="w-28">
          <label className={adminLabel}>Order</label>
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={leader?.sortOrder ?? 0}
            className={adminInput}
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-mist/75">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={leader?.isPublished ?? false}
            className="h-4 w-4 accent-[#a78bfa]"
          />
          Published on public site
        </label>
        <SubmitButton size="md">{leader ? "Save leader" : "Create leader"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminLeadersPage() {
  const [leaders, settings] = await Promise.all([getAllLeaders(), getSettings()]);
  const published = leaders.filter((leader) => leader.isPublished).length;

  return (
    <>
      <AdminHeader
        title="Leaders"
        description={`${published} of ${settings.leaderSlots} leader slots published. Leader identities are never invented — placeholders stay as TBA until you publish real details.`}
      />

      <div className="space-y-4">
        {leaders.map((leader) => (
          <Disclosure
            key={leader.id}
            label={`${leader.username} · ${leader.platform.toUpperCase()} ${leader.isPublished ? "· published" : "· draft"}`}
          >
            <LeaderForm leader={leader} />
            <form action={deleteLeaderAction} className="mt-5 border-t border-white/8 pt-4">
              <input type="hidden" name="id" value={leader.id} />
              <SubmitButton
                variant="danger"
                size="xs"
                confirm={`Remove ${leader.username} from the leader list?`}
              >
                Remove leader
              </SubmitButton>
            </form>
          </Disclosure>
        ))}
      </div>

      <div className="mt-6">
        <Panel title="Add a leader" description="Create an additional leader slot.">
          <div className="mb-4">
            <Badge tone="neutral">{leaders.length} slots configured</Badge>
          </div>
          <LeaderForm />
        </Panel>
      </div>
    </>
  );
}
