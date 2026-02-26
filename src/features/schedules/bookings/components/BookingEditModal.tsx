import { useMemo, useState, useEffect } from "react";
import type {
  Schedule,
  ScheduleType,
} from "../../../../services/labmanager/labScheduler.service";
import type { ScheduleStatus } from "../../../../services/labmanager/scheduleBooking.service";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  schedule?: Schedule | null;
  initial?: { start: string; end: string } | null;

  onClose: () => void;
  onCreate: (data: {
    LabRoomId: number;
    StartTime: string;
    EndTime: string;
    ScheduleType: ScheduleType;
    ScheduleStatus: ScheduleStatus;
  }) => Promise<void> | void;

  onUpdate: (
    id: string,
    data: {
      LabRoomId: number;
      StartTime: string;
      EndTime: string;
      ScheduleType: ScheduleType;
      ScheduleStatus: ScheduleStatus;
    },
  ) => Promise<void> | void;

  onDelete: (id: string) => Promise<void> | void;
};

const toInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};

const fromInput = (v: string) => new Date(v).toISOString();

const typeLabels: Record<ScheduleType, string> = {
  OLD_SLOT: "Old Slot",
  NEW_SLOT: "New Slot",
  OUT_SLOT: "Out Slot",
};

const statusLabels: Record<ScheduleStatus, string> = {
  APPROVED: "Approved",
  PENDING: "Pending",
  REJECTED: "Rejected",
};

const statusColors: Record<ScheduleStatus, string> = {
  APPROVED: "text-emerald-600 dark:text-emerald-400",
  PENDING: "text-amber-600 dark:text-amber-400",
  REJECTED: "text-red-600 dark:text-red-400",
};

export default function ScheduleEditModal({
  open,
  mode,
  schedule,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const title = useMemo(
    () => (mode === "create" ? "Create New Schedule" : "Edit Schedule"),
    [mode],
  );

  const [roomId, setRoomId] = useState<number | "">(
    () => schedule?.LabRoomId ?? "",
  );
  const [start, setStart] = useState<string>(() =>
    schedule ? toInput(schedule.StartTime) : "",
  );
  const [end, setEnd] = useState<string>(() =>
    schedule ? toInput(schedule.EndTime) : "",
  );
  const [type, setType] = useState<ScheduleType | "">(
    () => (schedule?.ScheduleType as ScheduleType) ?? "",
  );
  const [status, setStatus] = useState<ScheduleStatus | "">(
    () => (schedule?.ScheduleStatus as ScheduleStatus) ?? "",
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const submit = async () => {
    if (!roomId || !start || !end || !type || !status) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    const payload = {
      LabRoomId: Number(roomId),
      StartTime: fromInput(start),
      EndTime: fromInput(end),
      ScheduleType: type as ScheduleType,
      ScheduleStatus: status as ScheduleStatus,
    };

    setSaving(true);
    try {
      if (mode === "create") await onCreate(payload);
      else if (schedule) await onUpdate(schedule.Id, payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!schedule) return;
    const ok = window.confirm(
      "Are you sure you want to delete this schedule? This action cannot be undone.",
    );
    if (!ok) return;

    setDeleting(true);
    try {
      await onDelete(schedule.Id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    mode === "create"
                      ? "bg-blue-100 dark:bg-blue-500/10"
                      : "bg-purple-100 dark:bg-purple-500/10"
                  }`}
                >
                  <svg
                    className={`h-6 w-6 ${
                      mode === "create"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {mode === "create" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    )}
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  {schedule && (
                    <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                      ID: {schedule.Id}
                    </p>
                  )}
                </div>
              </div>

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

          <div className="p-6">
            <div className="space-y-5">
              <FormField label="Lab Room" icon="🚪">
                <select
                  value={roomId}
                  onChange={(e) =>
                    setRoomId(e.target.value ? Number(e.target.value) : "")
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                >
                  <option value="">Select a room</option>
                  <option value="101">Room 101</option>
                  <option value="102">Room 102</option>
                  <option value="103">Room 103</option>
                  <option value="201">Room 201</option>
                  <option value="202">Room 202</option>
                  <option value="203">Room 203</option>
                  <option value="301">Room 301</option>
                  <option value="302">Room 302</option>
                  <option value="303">Room 303</option>
                </select>
              </FormField>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="Start Time" icon="🕐">
                  <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                  />
                </FormField>

                <FormField label="End Time" icon="🕐">
                  <input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="Schedule Type" icon="🏷️">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ScheduleType)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                  >
                    <option value="">Select type</option>
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Status" icon="📊">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as ScheduleStatus)
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                  >
                    <option value="">Select status</option>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {status && (
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold dark:bg-gray-800 ${statusColors[status as ScheduleStatus]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            status === "APPROVED"
                              ? "bg-emerald-500"
                              : status === "PENDING"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                        />
                        {statusLabels[status as ScheduleStatus]}
                      </span>
                    </div>
                  )}
                </FormField>
              </div>

              {start && end && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                        Schedule Duration
                      </h4>
                      <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
                        {(() => {
                          const s = new Date(fromInput(start));
                          const e = new Date(fromInput(end));
                          const diff = e.getTime() - s.getTime();
                          const hours = Math.floor(diff / (1000 * 60 * 60));
                          const mins = Math.floor(
                            (diff % (1000 * 60 * 60)) / (1000 * 60),
                          );
                          return `${hours}h ${mins}m`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <div>
                {mode === "edit" && (
                  <button
                    type="button"
                    onClick={remove}
                    disabled={deleting || saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete Schedule
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={submit}
                  disabled={
                    saving ||
                    deleting ||
                    !roomId ||
                    !start ||
                    !end ||
                    !type ||
                    !status
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {mode === "create" ? "Creating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {mode === "create" ? "Create Schedule" : "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component
function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <span>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
