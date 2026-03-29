import type { Report } from "../types/report.type";
import { formatDate } from "../../../utils/formatDate";

function badge(status: boolean) {
  return status
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200"
    : "bg-amber-500/15 text-amber-700 dark:text-amber-200";
}

type Props = {
  loading: boolean;
  rows: Report[];
  onView: (id: string) => void;
  onToggleResolved?: (id: string, next: boolean) => void;
};

export default function ReportListTable({
  loading,
  rows,
  onView,
  onToggleResolved,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Report</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-gray-500 dark:text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-gray-500 dark:text-gray-400"
                >
                  No data available.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.Id} className="bg-white dark:bg-transparent">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-800 dark:text-white/90">
                      #{r.Id}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Schedule: {r.ScheduleId ?? "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4 font-semibold text-gray-800 dark:text-white/90">
                    {r.ReportType ?? "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {r.UserId}
                  </td>

                  <td className="px-4 py-4">
                    <div
                      className="max-w-[420px] truncate text-gray-700 dark:text-gray-300"
                      title={r.Description}
                    >
                      {r.Description}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge(r.IsResolved)}`}
                    >
                      {r.IsResolved ? "Resolved" : "Unresolved"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {r.CreatedAt ? formatDate(r.CreatedAt, "DD/MM/YYYY") : "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {r.UpdatedAt ? formatDate(r.UpdatedAt, "DD/MM/YYYY") : "-"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(r.Id)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
                      >
                        View detail
                      </button>

                      {onToggleResolved && !r.IsResolved && (
                        <button
                          type="button"
                          onClick={() => onToggleResolved(r.Id, true)}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Resolve
                        </button>
                      )}
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
