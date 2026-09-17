import { AdminHeader, MetricCard, Panel, adminInput, adminLabel } from "@/components/admin/ui";
import { Disclosure, SubmitButton } from "@/components/admin/client";
import {
  deleteResultAction,
  saveResultAction,
  toggleResultsPublishedAction,
} from "@/app/admin/actions";
import { formatDateTime } from "@/lib/competition";
import { getAllResults, getSettings, getTeamsWithMembers } from "@/lib/data";
import type { ResultRow } from "@/db/schema";

export const dynamic = "force-dynamic";

function ResultForm({
  result,
  teams,
}: {
  result?: ResultRow;
  teams: { id: number; name: string }[];
}) {
  return (
    <form action={saveResultAction} className="space-y-4">
      {result ? <input type="hidden" name="id" value={result.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={adminLabel}>Round name</label>
          <input
            name="roundName"
            defaultValue={result?.roundName ?? ""}
            placeholder="Round 1 / Semi-final / Grand final"
            className={adminInput}
            required
          />
        </div>
        <div>
          <label className={adminLabel}>Title</label>
          <input name="title" defaultValue={result?.title ?? ""} className={adminInput} required />
        </div>
      </div>
      <div>
        <label className={adminLabel}>Summary</label>
        <textarea
          name="summary"
          rows={2}
          defaultValue={result?.summary ?? ""}
          className={adminInput}
        />
      </div>
      <div>
        <label className={adminLabel}>Details</label>
        <textarea name="body" rows={4} defaultValue={result?.body ?? ""} className={adminInput} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={adminLabel}>Team</label>
          <select name="teamId" defaultValue={result?.teamId ?? ""} className={adminInput}>
            <option value="">No team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={adminLabel}>Placement</label>
          <input
            name="placement"
            defaultValue={result?.placement ?? ""}
            placeholder="1st place"
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Order</label>
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={result?.sortOrder ?? 0}
            className={adminInput}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-xs text-mist/75">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={result?.isPublished ?? false}
            className="h-4 w-4 accent-[#a78bfa]"
          />
          Published
        </label>
        <SubmitButton size="sm">{result ? "Save result" : "Create result"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminResultsPage() {
  const [settings, results, teamsWithMembers] = await Promise.all([
    getSettings(),
    getAllResults(),
    getTeamsWithMembers(),
  ]);
  const teams = teamsWithMembers.map(({ team }) => ({ id: team.id, name: team.name }));
  const published = results.filter((result) => result.isPublished).length;

  return (
    <>
      <AdminHeader
        title="Results"
        description="Publish round results, standings and winner announcements manually. Nothing is generated automatically."
        actions={
          <form action={toggleResultsPublishedAction}>
            <input type="hidden" name="publish" value={settings.resultsPublished ? "0" : "1"} />
            <SubmitButton size="md" variant={settings.resultsPublished ? "danger" : "primary"}>
              {settings.resultsPublished ? "Hide results page" : "Publish results page"}
            </SubmitButton>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Result entries" value={results.length} />
        <MetricCard label="Published entries" value={published} tone="gold" />
        <MetricCard
          label="Public results page"
          value={settings.resultsPublished ? "Live" : "Hidden"}
          tone={settings.resultsPublished ? "green" : "amber"}
        />
      </div>

      <div className="mt-6">
        <Panel title="Result entries">
          {results.length === 0 ? (
            <p className="py-8 text-center text-sm text-mist/55">
              No results created yet. The public page shows the configured placeholder text.
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <Disclosure
                  key={result.id}
                  label={`${result.roundName} · ${result.title}${result.isPublished ? ` · ${formatDateTime(result.publishedAt ?? result.createdAt)}` : " · draft"}`}
                >
                  <ResultForm result={result} teams={teams} />
                  <form action={deleteResultAction} className="mt-4 border-t border-white/8 pt-4">
                    <input type="hidden" name="id" value={result.id} />
                    <SubmitButton size="xs" variant="danger" confirm={`Delete “${result.title}”?`}>
                      Delete result
                    </SubmitButton>
                  </form>
                </Disclosure>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="New result entry">
          <ResultForm teams={teams} />
        </Panel>
      </div>
    </>
  );
}
