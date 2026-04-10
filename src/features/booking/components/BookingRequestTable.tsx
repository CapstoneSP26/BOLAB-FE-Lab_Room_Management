import type { BookingRequest } from "../../booking/types/booking.type";
import {
  formatUtcDateLabel,
  formatBookingTimeLabel,
} from "../../../utils/date.util";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { statusClass } from "../../../utils/status";
type Props = {
  loading: boolean;
  rows: BookingRequest[];
  emptyText?: string;

  // Pagination props
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;

  onView: (b: BookingRequest) => void;

  onApprove?: (id: string) => void | Promise<void>;
  handleOpenRejectModal: (id: string) => void
};

export default function BookingTable({
  loading,
  rows,
  emptyText = "No bookings.",
  page,
  totalPages,
  totalCount,
  onPageChange,
  onView,
  onApprove,
  handleOpenRejectModal,
}: Props) {
  const hasActions = Boolean(onApprove && handleOpenRejectModal);

  const pageButtons = Array.from(
    { length: Math.min(5, Math.max(totalPages, 1)) },
    (_, index) => {
      const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
      return startPage + index;
    },
  ).filter((value) => value <= totalPages);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
            <tr>
              {/* <th className="px-4 py-3">Booking</th> */}
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
                  <td className="px-4 py-4 font-semibold text-gray-800 dark:text-white/90">
                    {b.roomName}
                    <div className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                      {b.buildingName}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    <div>{b.date}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {convertHoursUtcToVN(b.startTime) + " - " + convertHoursUtcToVN(b.endTime)}
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
                            onClick={() => handleOpenRejectModal(b.id.toString())}
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

      {/* Pagination */}
      <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900/40">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {page}
          </span>{" "}
          / {Math.max(totalPages, 1)}. Total requests:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalCount}
          </span>
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {pageButtons.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onPageChange(value)}
              className={`h-10 w-10 rounded-lg text-sm font-semibold transition ${
                value === page
                  ? "bg-brand-500 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {value}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
