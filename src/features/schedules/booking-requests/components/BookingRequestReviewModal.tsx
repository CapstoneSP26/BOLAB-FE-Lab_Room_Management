import { useEffect, useMemo } from "react";
import type { Booking } from "../../../../services/labmanager/bookingRequest.service";

type Props = {
  open: boolean;
  booking: Booking | null;
  loading?: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

const norm = (s: unknown) => String(s ?? "").toUpperCase();

function isPendingStatus(status: unknown) {
  return norm(status) === "PENDING";
}

function statusMeta(status: unknown) {
  const s = norm(status);
  if (s === "PENDING")
    return {
      label: "Pending",
      cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      dot: "bg-amber-500",
    };
  if (s === "REJECTED")
    return {
      label: "Rejected",
      cls: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
      dot: "bg-red-500",
    };
  if (s === "APPROVED")
    return {
      label: "Approved",
      cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
      dot: "bg-emerald-500",
    };
  return {
    label: s || "Unknown",
    cls: "bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400",
    dot: "bg-gray-400",
  };
}

function fmtDateTime(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function fmtDate(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-US", { dateStyle: "medium" });
}

export default function BookingRequestModal({
  open,
  booking,
  loading = false,
  onClose,
  onApprove,
  onReject,
}: Props) {
  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pending = booking ? isPendingStatus(booking.BookingStatus) : false;

  const meta = useMemo(
    () => statusMeta(booking?.BookingStatus),
    [booking?.BookingStatus],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Panel */}
      <div className="relative w-full max-w-5xl">
        <div className="no-scrollbar max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-8 py-6 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/95">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Booking Request Details
                </h3>
                <p className="mt-1 font-mono text-sm text-gray-500 dark:text-gray-400">
                  {booking?.Id || "Loading..."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold ${meta.cls}`}
                >
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 active:scale-95 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6L18 18M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <Skeleton />
            ) : !booking ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-12 dark:border-gray-700">
                <svg
                  className="h-16 w-16 text-gray-400"
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
                <p className="mt-4 text-base font-medium text-gray-700 dark:text-gray-300">
                  No booking found
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This booking request could not be loaded
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Main Info Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Room & Schedule */}
                  <InfoCard title="Location & Time">
                    <InfoRow label="Room" value={`Room ${booking.LabRoomId}`} />
                    <InfoRow
                      label="Start Time"
                      value={fmtDateTime(booking.StartTime)}
                    />
                    <InfoRow
                      label="End Time"
                      value={fmtDateTime(booking.EndTime)}
                    />
                    <InfoRow
                      label="Group Size"
                      value={String(booking.group_size)}
                    />
                  </InfoCard>

                  {/* User Info */}
                  <InfoCard title="Requester">
                    <InfoRow
                      label="User ID"
                      value={booking.BookedByUserId}
                      mono
                    />
                    <InfoRow
                      label="Purpose Name"
                      value={booking.PurposeTypeName}
                    />
                    <InfoRow
                      label="Booking Type"
                      value={booking.BookingType || "-"}
                    />
                  </InfoCard>

                  <InfoCard title="Recurrence">
                    <InfoRow
                      label="Weekly Recurring"
                      value={booking.IsWeeklyRecurring ? "Yes" : "No"}
                      highlight={booking.IsWeeklyRecurring}
                    />
                    {booking.IsWeeklyRecurring && (
                      <InfoRow
                        label="Recurring Until"
                        value={
                          booking.RecurringUntil
                            ? fmtDate(booking.RecurringUntil)
                            : "No end date"
                        }
                      />
                    )}
                  </InfoCard>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Booking Reason
                    </h4>
                  </div>
                  <div className="px-6 py-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                      {booking.Reason || (
                        <span className="italic text-gray-400">
                          No reason provided
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Audit Trail
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                    <AuditItem
                      label="Created"
                      value={fmtDateTime(booking.CreatedAt)}
                      user={booking.CreatedBy}
                    />
                    <AuditItem
                      label="Last Updated"
                      value={fmtDateTime(booking.UpdatedAt)}
                      user={booking.UpdatedBy}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/30 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    {!pending && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Actions are only available for{" "}
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          PENDING
                        </span>{" "}
                        status bookings.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Close
                    </button>

                    {pending && (
                      <>
                        <button
                          type="button"
                          onClick={() => onReject(booking.Id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98]"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => onApprove(booking.Id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-[0.98]"
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

// Helper Components
function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h4>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div
        className={`mt-1 break-words text-sm font-semibold ${
          mono ? "font-mono text-xs" : ""
        } ${
          highlight
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function AuditItem({
  label,
  value,
  user,
}: {
  label: string;
  value: string;
  user: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/30">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400">
        by {user}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="h-12 animate-pulse bg-gray-100 dark:bg-gray-800" />
            <div className="space-y-4 p-5">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="h-12 animate-pulse bg-gray-100 dark:bg-gray-800" />
        <div className="p-6">
          <div className="h-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="h-12 animate-pulse bg-gray-100 dark:bg-gray-800" />
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/30">
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
