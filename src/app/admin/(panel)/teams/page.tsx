import { and, eq, isNull } from "drizzle-orm";
import { Users } from "lucide-react";

import { db } from "@/db";
import { registrations, teamMembers } from "@/db/schema";
import { AdminHeader, MetricCard, Panel, adminInput, adminLabel } from "@/components/admin/ui";
import { Disclosure, SubmitButton } from "@/components/admin/client";
import {
  assignEditorAction,
  deleteTeamAction,
  publishTeamsAction,
  removeTeamMemberAction,
  saveTeamAction,
} from "@/app/admin/actions";
import { getAllLeaders, getSettings, getTeamsWithMembers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const [settings, teamsWithMembers, leaders] = await Promise.all([
    getSettings(),
    getTeamsWithMembers(),
    getAllLeaders(),
  ]);

  const unassigned = await db
    .select({
      id: registrations.id,
      displayName: registrations.displayName,
      editingUsername: registrations.editingUsername,
      platform: registrations.platform,
    })
    .from(registrations)
    .leftJoin(teamMembers, eq(teamMembers.registrationId, registrations.id))
    .where(
      and(
        eq(registrations.status, "selected"),
        eq(registrations.isDeleted, false),
        isNull(teamMembers.id),
      ),
    );

  const assignedCount = teamsWithMembers.reduce((total, item) => total + item.members.length, 0);

  return (
    <>
      <AdminHeader
        title="Teams"
        description="Manual team formation only. Editors must be marked as Selected before they can join a competition team."
        actions={
          <form action={publishTeamsAction}>
            <input type="hidden" name="publish" value={settings.teamsPublished ? "0" : "1"} />
            <SubmitButton
              size="md"
              variant={settings.teamsPublished ? "danger" : "primary"}
              confirm={
                settings.teamsPublished
                  ? "Hide team assignments from the public editors page?"
                  : "Publish team assignments to the public editors page?"
              }
            >
              {settings.teamsPublished ? "Unpublish teams" : "Publish teams"}
            </SubmitButton>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Teams" value={teamsWithMembers.length} />
        <MetricCard label="Assigned editors" value={assignedCount} tone="gold" />
        <MetricCard label="Unassigned selected" value={unassigned.length} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {teamsWithMembers.map(({ team, leader, members }) => (
          <Panel
            key={team.id}
            title={team.name}
            description={`${members.length}/${team.capacity} members · leader: ${leader?.username ?? "unassigned"}`}
          >
            {members.length === 0 ? (
              <p className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-xs text-mist/50">
                No editors assigned yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5"
                  >
                    <span className="text-sm text-white">
                      {member.username}
                      {member.platform ? (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.16em] text-mist/45">
                          {member.platform}
                        </span>
                      ) : null}
                    </span>
                    <form action={removeTeamMemberAction}>
                      <input type="hidden" name="registrationId" value={member.registrationId} />
                      <SubmitButton size="xs" variant="subtle">
                        Remove
                      </SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            {unassigned.length > 0 && members.length < team.capacity ? (
              <form action={assignEditorAction} className="mt-4 flex flex-wrap items-end gap-3">
                <input type="hidden" name="teamId" value={team.id} />
                <div className="min-w-[200px] flex-1">
                  <label className={adminLabel}>Assign selected editor</label>
                  <select name="registrationId" className={adminInput} required>
                    <option value="">Choose an editor…</option>
                    {unassigned.map((editor) => (
                      <option key={editor.id} value={editor.id}>
                        {editor.editingUsername} ({editor.platform ?? "n/a"})
                      </option>
                    ))}
                  </select>
                </div>
                <SubmitButton size="sm">Assign</SubmitButton>
              </form>
            ) : null}

            <div className="mt-5 border-t border-white/8 pt-4">
              <Disclosure label="Edit team">
                <form action={saveTeamAction} className="space-y-4">
                  <input type="hidden" name="id" value={team.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={adminLabel}>Team name</label>
                      <input name="name" defaultValue={team.name} className={adminInput} required />
                    </div>
                    <div>
                      <label className={adminLabel}>Leader</label>
                      <select
                        name="leaderId"
                        defaultValue={team.leaderId ?? ""}
                        className={adminInput}
                      >
                        <option value="">Unassigned</option>
                        {leaders.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.username} ({item.platform})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className={adminLabel}>Capacity</label>
                      <input
                        name="capacity"
                        type="number"
                        min={1}
                        max={16}
                        defaultValue={team.capacity}
                        className={adminInput}
                      />
                    </div>
                    <div>
                      <label className={adminLabel}>Order</label>
                      <input
                        name="sortOrder"
                        type="number"
                        min={0}
                        defaultValue={team.sortOrder}
                        className={adminInput}
                      />
                    </div>
                    <div>
                      <label className={adminLabel}>Motto</label>
                      <input name="motto" defaultValue={team.motto ?? ""} className={adminInput} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <SubmitButton size="sm">Save team</SubmitButton>
                  </div>
                </form>
                <form action={deleteTeamAction} className="mt-4 border-t border-white/8 pt-4">
                  <input type="hidden" name="id" value={team.id} />
                  <SubmitButton
                    size="xs"
                    variant="danger"
                    confirm={`Delete ${team.name}? Assigned editors will be released.`}
                  >
                    Delete team
                  </SubmitButton>
                </form>
              </Disclosure>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Create a team">
          <form action={saveTeamAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabel}>Team name</label>
                <input name="name" placeholder="Team name" className={adminInput} required />
              </div>
              <div>
                <label className={adminLabel}>Leader</label>
                <select name="leaderId" defaultValue="" className={adminInput}>
                  <option value="">Unassigned</option>
                  {leaders.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.username} ({item.platform})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={adminLabel}>Capacity</label>
                <input
                  name="capacity"
                  type="number"
                  min={1}
                  max={16}
                  defaultValue={settings.defaultTeamCapacity}
                  className={adminInput}
                />
              </div>
              <div>
                <label className={adminLabel}>Order</label>
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={teamsWithMembers.length}
                  className={adminInput}
                />
              </div>
              <div>
                <label className={adminLabel}>Motto</label>
                <input name="motto" className={adminInput} placeholder="Optional" />
              </div>
            </div>
            <SubmitButton size="md">Create team</SubmitButton>
          </form>
        </Panel>

        <Panel
          title="Unassigned selected editors"
          description="Editors who made the Final 16 but have no team yet."
        >
          {unassigned.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Users size={24} className="text-mist/35" />
              <p className="text-xs text-mist/50">Every selected editor has a team.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {unassigned.map((editor) => (
                <li
                  key={editor.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5 text-sm"
                >
                  <span className="text-white">{editor.editingUsername}</span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-mist/45">
                    {editor.platform ?? "platform n/a"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
