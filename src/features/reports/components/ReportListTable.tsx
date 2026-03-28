import type { Report } from "../types/report.type";
import { formatDate } from "../../../utils/formatDate";

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
                <tr key={r.id} className="bg-white dark:bg-transparent">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-800 dark:text-white/90">
                      #{r.id}
                    </div>
                  </td>

                  <td className="px-4 py-4 font-semibold text-gray-800 dark:text-white/90">
                    {r.reportType ?? "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {r.userName}
                  </td>

                  <td className="px-4 py-4">
                    <div
                      className="max-w-[420px] truncate text-gray-700 dark:text-gray-300"
                      title={r.description}
                    >
                      {r.description}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-200">
                      Unresolved
                    </span>
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {r.createdAt ? formatDate(r.createdAt, "DD/MM/YYYY") : "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {r.updatedAt ? formatDate(r.updatedAt, "DD/MM/YYYY") : "-"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(r.id)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
                      >
                        View detail
                      </button>

                      {onToggleResolved && (
                        <button
                          type="button"
                          onClick={() => onToggleResolved(r.id, true)}
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
