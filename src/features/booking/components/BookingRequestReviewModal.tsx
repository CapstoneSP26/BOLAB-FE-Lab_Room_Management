import { useEffect } from "react";
import type { BookingRequest } from "../../booking/types/booking.type";
import { InfoCard, InfoRow, Skeleton } from "./BookingRequestModalParts";
import { norm } from "../../../utils/status";
import { formatUtcDateLabel, convertHoursUtcToVN } from "../../../utils/date.util";
import { AlertCircle, Calendar } from "lucide-react";

type Props = {
  open: boolean;
  booking: BookingRequest | null;
  loading?: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  handleOpenRejectModal: (id: string) => void;
};

function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11.5px] font-semibold text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-400">
      {children}
    </span>
  );
}

export default function BookingRequestReviewModal({
  open,
  booking,
  loading = false,
  onClose,
  onApprove,
  handleOpenRejectModal,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const isPending = norm(booking?.status).startsWith("PENDING");

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="relative w-full max-w-3xl animate-in fade-in zoom-in-95 duration-200">
        <div className="no-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-200/60">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 px-8 py-6 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Booking Request Details
                  </h3>
                  <p className="mt-1 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
                    ID: {booking?.id ?? "Loading..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {booking && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    {String(booking.status)}
                  </span>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-90 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {loading ? (
              <Skeleton />
            ) : !booking ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 p-12 dark:border-gray-800">
                <svg
                  className="h-16 w-16 text-gray-200 dark:text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                  No booking found
                </p>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  This booking request could not be loaded
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Meta chips */}
                <div className="flex flex-wrap items-center gap-3">
                  <TagChip>
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {booking.buildingName} — {booking.roomName}
                  </TagChip>

                  {booking.studentCount != null && (
                    <TagChip>
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
                        />
                      </svg>
                      {booking.studentCount} students
                    </TagChip>
                  )}

                  <TagChip>
                    <Calendar className="h-3.5 w-3.5" />
                    {formatUtcDateLabel(booking.date)}
                  </TagChip>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <InfoCard title="Location & Time">
                    <InfoRow label="Room" value={booking.roomName || "-"} />
                    <InfoRow
                      label="Building"
                      value={booking.buildingName || "-"}
                    />
                    <InfoRow
                      label="Date"
                      value={formatUtcDateLabel(booking.date) || "-"}
                      mono
                    />
                    <InfoRow
                      label="Start"
                      value={
                        booking.startTime
                          ? convertHoursUtcToVN(booking.startTime)
                          : "—"
                      }
                      mono
                    />
                    <InfoRow
                      label="End"
                      value={
                        booking.endTime
                          ? convertHoursUtcToVN(booking.endTime)
                          : "—"
                      }
                      mono
                    />
                    <InfoRow
                      label="Students"
                      value={String(booking.studentCount ?? "-")}
                    />
                  </InfoCard>

                  <InfoCard title="Requester">
                    <InfoRow
                      label="Full Name"
                      value={booking.requester?.fullName || "-"}
                    />
                    <InfoRow
                      label="User code"
                      value={booking.requester?.userCode || "-"}
                      mono
                    />
                    <InfoRow
                      label="Email"
                      value={booking.requester?.email || "-"}
                    />
                    <InfoRow
                      label="Subject code"
                      value={booking.requester?.subjectCode || "-"}
                    />
                    <InfoRow
                      label="Group"
                      value={booking.requester?.group || "-"}
                    />
                  </InfoCard>
                </div>

                {/* Purpose */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/80">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-gray-400 dark:text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Purpose of Request
                    </span>
                  </div>
                  <div className="px-6 py-6 font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                    <p className="whitespace-pre-wrap break-words text-[15px]">
                      {booking.purpose || (
                        <span className="italic text-gray-300 dark:text-gray-600">
                          No details provided
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {String(booking.status).trim().toLowerCase() === "rejected" && booking.reason && (
                    <div className="overflow-hidden rounded-2xl border border-red-100 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/10">
                      <div className="flex items-center gap-2 border-b border-red-100 bg-red-50/50 px-6 py-4 dark:border-red-900/30 dark:bg-red-900/20">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                          Reason for Rejection
                        </span>
                      </div>
                      <div className="px-6 py-6 font-medium leading-relaxed text-red-950 dark:text-red-200">
                        <p className="whitespace-pre-wrap break-words text-[15px]">
                          {booking.reason}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Action bar */}
                <div className="flex flex-col-reverse gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-800/30 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    {!isPending && (
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Status:{" "}
                        <span className="text-gray-900 dark:text-white">
                          This booking is no longer pending.
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    >
                      Close
                    </button>

                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenRejectModal(String(booking.id))
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-bold text-red-700 shadow-sm transition-all hover:bg-red-100 active:scale-[0.98] dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          onClick={() => onApprove(String(booking.id))}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 active:scale-[0.98] dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}