import type { Booking } from "../../type";

function badgeClass(status: unknown) {
  const s = String(status ?? "").toUpperCase();
  if (s === "PENDING")
    return "bg-amber-500/15 text-amber-700 dark:text-amber-200";
  if (s === "REJECTED") return "bg-red-500/15 text-red-700 dark:text-red-200";
  return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200";
}

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);

  const fmtTime = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
  };
  const fmtDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return `${fmtDate(s)} • ${fmtTime(s)} - ${fmtTime(e)}`;
}

type Props = {
  loading: boolean;
  rows: Booking[];
  emptyText?: string;

  onView: (b: Booking) => void;

  // optional để dùng cho history
  onApprove?: (id: string) => void | Promise<void>;
  onReject?: (id: string) => void | Promise<void>;
};

export default function BookingTable({
  loading,
  rows,
  emptyText = "No bookings.",
  onView,
  onApprove,
  onReject,
}: Props) {
  const hasActions = Boolean(onApprove && onReject);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">
                {hasActions ? "Actions" : "View"}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td
                  className="px-4 py-6 text-gray-500 dark:text-gray-400"
                  colSpan={8}
                >
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-gray-500 dark:text-gray-400"
                  colSpan={8}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.Id} className="bg-white dark:bg-transparent">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-800 dark:text-white/90">
                      #{b.Id}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      User: {b.BookedByUserId}
                    </div>
                  </td>

                  <td className="px-4 py-4 font-semibold text-gray-800 dark:text-white/90">
                    Room {b.LabRoomId}
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {formatRange(b.StartTime, b.EndTime)}
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {b.group_size}
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {b.PurposeTypeName}
                  </td>

                  <td className="px-4 py-4">
                    <div className="max-w-[280px] truncate text-gray-700 dark:text-gray-300">
                      {b.Reason}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                        b.BookingStatus,
                      )}`}
                    >
                      {String(b.BookingStatus)}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(b)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
                      >
                        View
                      </button>

                      {hasActions && (
                        <>
                          <button
                            type="button"
                            onClick={() => onReject?.(b.Id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            onClick={() => onApprove?.(b.Id)}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        </>
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
