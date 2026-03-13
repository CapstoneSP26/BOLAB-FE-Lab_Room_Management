import type { Incident } from "../api/incidentHistoryApi";

const norm = (v: unknown) => String(v ?? "").toUpperCase();

function statusBadgeClass(v: unknown) {
  const st = norm(v);
  if (st === "OPEN")
    return "bg-amber-500/15 text-amber-700 dark:text-amber-200";
  if (st === "CLOSED") return "bg-gray-500/10 text-gray-700 dark:text-gray-200";
  return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200";
}

function severityBadgeClass(v: unknown) {
  const st = norm(v);
  if (st === "CRITICAL") return "bg-red-500/15 text-red-700 dark:text-red-200";
  if (st === "HIGH")
    return "bg-orange-500/15 text-orange-700 dark:text-orange-200";
  if (st === "LOW") return "bg-gray-500/10 text-gray-700 dark:text-gray-200";
  return "bg-amber-500/15 text-amber-700 dark:text-amber-200";
}

function fmt(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function shortId(id: string, keep = 6) {
  if (!id) return "-";
  if (id.length <= keep * 2 + 3) return id;
  return `${id.slice(0, keep)}...${id.slice(-keep)}`;
}

export default function IncidentHistoryTable({
  loading,
  rows,
  onView,
}: {
  loading: boolean;
  rows: Incident[];
  onView: (x: Incident) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase text-gray-500 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:bg-white/[0.04] dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Incident</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Resolved</th>
              <th className="px-4 py-3">By</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td
                  className="px-4 py-8 text-gray-500 dark:text-gray-400"
                  colSpan={8}
                >
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-gray-500 dark:text-gray-400"
                  colSpan={8}
                >
                  No incidents yet.
                </td>
              </tr>
            ) : (
              rows.map((x, idx) => (
                <tr
                  key={x.Id}
                  className={[
                    "bg-white dark:bg-transparent",
                    idx % 2 === 1 ? "bg-gray-50/40 dark:bg-white/[0.02]" : "",
                    "hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors",
                  ].join(" ")}
                >
                  {/* Incident */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <div className="font-semibold text-gray-800 dark:text-white/90">
                        #{shortId(x.Id, 6)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Report:{" "}
                        <span className="font-mono">
                          {shortId(x.ReportId, 6)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Room */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center rounded-full bg-gray-500/10 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Room {x.LabRoomId}
                    </span>
                  </td>

                  {/* Title + desc */}
                  <td className="px-4 py-4">
                    <div className="max-w-[420px] truncate font-semibold text-gray-800 dark:text-white/90">
                      {x.Title}
                    </div>
                    <div className="mt-1 max-w-[520px] truncate text-xs text-gray-500 dark:text-gray-400">
                      {x.Description}
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${severityBadgeClass(
                        x.Severity,
                      )}`}
                    >
                      {norm(x.Severity) || "-"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                        x.Status,
                      )}`}
                    >
                      {norm(x.Status) || "-"}
                    </span>
                  </td>

                  {/* Resolved */}
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {fmt(x.ResolvedAt)}
                  </td>

                  {/* By */}
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {x.ResolvedBy ?? "-"}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => onView(x)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
