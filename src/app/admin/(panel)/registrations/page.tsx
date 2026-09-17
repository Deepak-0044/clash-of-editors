import Link from "next/link";
import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { ExternalLink, Search } from "lucide-react";

import { db } from "@/db";
import { evaluations, registrations } from "@/db/schema";
import {
  AdminHeader,
  Panel,
  StatusTag,
  TableWrap,
  Td,
  Th,
  adminInput,
} from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/client";
import { REGISTRATION_STATUS_LABELS, formatDateTime } from "@/lib/competition";
import { updateRegistrationStatusAction } from "@/app/admin/actions";
import { getRegistrationStats, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  q?: string;
  status?: string;
  sort?: string;
  page?: string;
}>;

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const statusFilter = params.status ?? "all";
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const settings = await getSettings();
  const stats = await getRegistrationStats();

  const conditions: SQL[] = [eq(registrations.isDeleted, false)];
  if (q) {
    const like = `%${q}%`;
    const search = or(
      ilike(registrations.displayName, like),
      ilike(registrations.editingUsername, like),
      ilike(registrations.email, like),
    );
    if (search) conditions.push(search);
  }
  if (statusFilter !== "all" && statusFilter in REGISTRATION_STATUS_LABELS) {
    conditions.push(
      eq(registrations.status, statusFilter as keyof typeof REGISTRATION_STATUS_LABELS),
    );
  }
  const where = and(...conditions);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(registrations)
    .where(where);

  const rows = await db
    .select({
      id: registrations.id,
      displayName: registrations.displayName,
      editingUsername: registrations.editingUsername,
      email: registrations.email,
      submissionLink: registrations.submissionLink,
      platform: registrations.platform,
      status: registrations.status,
      createdAt: registrations.createdAt,
      overallQuality: evaluations.overallQuality,
    })
    .from(registrations)
    .leftJoin(evaluations, eq(evaluations.registrationId, registrations.id))
    .where(where)
    .orderBy(sort === "oldest" ? asc(registrations.createdAt) : desc(registrations.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (next: Record<string, string | number>) => {
    const search = new URLSearchParams({
      q,
      status: statusFilter,
      sort,
      page: String(page),
      ...Object.fromEntries(Object.entries(next).map(([key, value]) => [key, String(value)])),
    });
    return `/admin/registrations?${search.toString()}`;
  };

  return (
    <>
      <AdminHeader
        title="Registrations"
        description={`${stats.total} total registrations · ${stats.selected} of ${settings.editorSlots} selected. Participant emails stay inside this dashboard.`}
      />

      <Panel className="mb-6">
        <form method="get" className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist/40"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, username or email"
              className={`${adminInput} pl-9`}
            />
          </div>
          <select name="status" defaultValue={statusFilter} className={adminInput}>
            <option value="all">All statuses</option>
            {Object.entries(REGISTRATION_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select name="sort" defaultValue={sort} className={adminInput}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <SubmitButton size="md">Filter</SubmitButton>
        </form>
      </Panel>

      <Panel
        title={`Results · ${total}`}
        description={`Page ${page} of ${totalPages}`}
      >
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-mist/55">
            No registrations match this filter.
          </p>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Editor</Th>
                <Th>Contact</Th>
                <Th>Audition</Th>
                <Th>Status</Th>
                <Th>Submitted</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <Td>
                    <span className="block font-medium text-white">{row.displayName}</span>
                    <span className="text-xs text-mist/50">@{row.editingUsername}</span>
                  </Td>
                  <Td className="text-xs text-mist/60">{row.email}</Td>
                  <Td>
                    <a
                      href={row.submissionLink}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-bright"
                    >
                      Open <ExternalLink size={12} />
                    </a>
                    {row.overallQuality !== null ? (
                      <span className="ml-3 text-[11px] text-mist/45">
                        Q {row.overallQuality}/10
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    <StatusTag status={row.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-xs text-mist/55">
                    {formatDateTime(row.createdAt)}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form action={updateRegistrationStatusAction} className="flex items-center gap-1.5">
                        <input type="hidden" name="id" value={row.id} />
                        <input
                          type="hidden"
                          name="returnTo"
                          value={`/admin/registrations?${new URLSearchParams({ q, status: statusFilter, sort, page: String(page) })}`}
                        />
                        <select
                          name="status"
                          defaultValue={row.status}
                          className="rounded-lg border border-white/12 bg-ink-800 px-2 py-1.5 text-[11px] text-white"
                        >
                          {Object.entries(REGISTRATION_STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <SubmitButton size="xs" variant="subtle">
                          Set
                        </SubmitButton>
                      </form>
                      <Link
                        href={`/admin/registrations/${row.id}`}
                        className="rounded-lg border border-gold/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold transition hover:bg-gold/10"
                      >
                        Review
                      </Link>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <Link
              href={buildHref({ page: Math.max(1, page - 1) })}
              aria-disabled={page === 1}
              className={`rounded-lg border border-white/12 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] ${
                page === 1 ? "pointer-events-none opacity-40" : "text-mist hover:text-white"
              }`}
            >
              Previous
            </Link>
            <span className="text-[11px] uppercase tracking-[0.18em] text-mist/50">
              Page {page} / {totalPages}
            </span>
            <Link
              href={buildHref({ page: Math.min(totalPages, page + 1) })}
              aria-disabled={page === totalPages}
              className={`rounded-lg border border-white/12 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] ${
                page === totalPages ? "pointer-events-none opacity-40" : "text-mist hover:text-white"
              }`}
            >
              Next
            </Link>
          </div>
        ) : null}
      </Panel>
    </>
  );
}
