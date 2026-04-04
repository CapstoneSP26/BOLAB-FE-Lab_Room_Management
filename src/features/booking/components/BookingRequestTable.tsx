import type { BookingRequest } from "../../booking/types/booking.type";
import {
  formatUtcDateLabel,
  formatBookingTimeLabel,
} from "../../../utils/date.util";
import { statusClass } from "../../../utils/status";
type Props = {
  loading: boolean;
  rows: BookingRequest[];
  emptyText?: string;

  onView: (b: BookingRequest) => void;

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
                  colSpan={7}
                >
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-gray-500 dark:text-gray-400"
                  colSpan={7}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={String(b.id)} className="bg-white dark:bg-transparent">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-800 dark:text-white/90">
                      {b.purpose ?? "No purpose provided"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      User: {b.requestedBy}
                    </div>
                  </td>

                  <td className="px-4 py-4 font-semibold text-gray-800 dark:text-white/90">
                    {b.roomName}
                    <div className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                      {b.buildingName}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    <div>{formatUtcDateLabel(b.startTime)}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatBookingTimeLabel(b.startTime, b.startTime)} -{" "}
                      {formatBookingTimeLabel(b.startTime, b.endTime)}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {b.studentCount ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="max-w-[280px] truncate text-gray-700 dark:text-gray-300">
                      {b.purpose ?? "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                        b.status,
                      )}`}
                    >
                      {String(b.status)}
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
                            onClick={() => onReject?.(String(b.id))}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            onClick={() => onApprove?.(String(b.id))}
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
