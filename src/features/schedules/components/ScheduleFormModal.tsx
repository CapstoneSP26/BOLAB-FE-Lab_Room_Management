import { type FormEvent, useState } from "react";
import {
  Loader2,
  PencilLine,
  PlusCircle,
  X,
  Calendar,
  Clock,
  DoorOpen,
  BookOpen,
  Tag,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
} from "lucide-react";
import { useResolveLabRoomIdForSchedule } from "../../labroom/hooks/useLabRoomLookup";
import { useLabRoomDetail } from "../../labroom/hooks/useLabRooms";
import type { LabRoomDto } from "../../labroom/types/room.type";
import type {
  CreateScheduleCommand,
  ScheduleDto,
  ScheduleStatus,
} from "../types/schedule.type";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "../../../utils/date.util";

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  schedule?: ScheduleDto | null;
  roomOptions: LabRoomDto[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateScheduleCommand) => Promise<void>;
};

function defaultValues(schedule?: ScheduleDto | null): CreateScheduleCommand {
  if (!schedule) {
    return {
      labRoomId: 0,
      roomName: "",
      slotTypeId: undefined,
      subjectId: "",
      subjectCode: "",
      startTime: "",
      endTime: "",
      type: "",
      status: "NotYet",
    };
  }

  const status: ScheduleStatus =
    schedule.status === "NotYet" ||
    schedule.status === "Active" ||
    schedule.status === "Finish"
      ? schedule.status
      : "NotYet";

  return {
    labRoomId: schedule.labRoomId ?? 0,
    roomName: schedule.labRoomName ?? "",
    slotTypeId: undefined,
    subjectId: (schedule.subjectId ?? "").trim(),
    subjectCode: (schedule.subjectCode ?? "").trim(),
    startTime: toDatetimeLocalValue(schedule.startTime),
    endTime: toDatetimeLocalValue(schedule.endTime),
    type: schedule.type?.trim() ?? "",
    status,
  };
}

const STATUS_CONFIG = {
  NotYet: {
    label: "Not Yet",
    color:
      "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500/30",
  },
  Active: {
    label: "Active",
    color:
      "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30",
  },
  Finish: {
    label: "Finished",
    color:
      "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  },
};

export default function ScheduleFormModal({
  isOpen,
  mode,
  schedule,
  roomOptions,
  isLoading = false,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<CreateScheduleCommand>(() =>
    defaultValues(schedule),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateScheduleCommand, string>>
  >({});
  const [userTouchedRoomId, setUserTouchedRoomId] = useState(false);

  const { resolvedLabRoomId, isResolving } = useResolveLabRoomIdForSchedule({
    labRoomId: schedule?.labRoomId,
    labRoomName: schedule?.labRoomName,
    enabled: isOpen && mode === "edit" && !!schedule,
  });

  const derivedLabRoomId =
    values.labRoomId && values.labRoomId > 0
      ? values.labRoomId
      : (resolvedLabRoomId ?? 0);

  const roomIdValid = Number.isFinite(derivedLabRoomId) && derivedLabRoomId > 0;

  const { data: roomDetail, isFetching: roomDetailLoading } = useLabRoomDetail(
    roomIdValid ? derivedLabRoomId : undefined,
    { enabled: isOpen && roomIdValid },
  );

  if (!isOpen) return null;

  const validate = () => {
    const next: Partial<Record<keyof CreateScheduleCommand, string>> = {};

    if (!derivedLabRoomId || derivedLabRoomId <= 0) {
      next.labRoomId = "Valid lab room ID is required.";
    }

    if (!values.startTime) {
      next.startTime = "Start time is required.";
    }

    if (!values.endTime) {
      next.endTime = "End time is required.";
    }

    if (values.startTime && values.endTime) {
      const startTime = fromDatetimeLocalValue(values.startTime);
      const endTime = fromDatetimeLocalValue(values.endTime);

      if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
        next.endTime = "End must be after start.";
      }
    }

    if (!values.type.trim()) {
      next.type = "Schedule type is required.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const startTime = fromDatetimeLocalValue(values.startTime);
    const endTime = fromDatetimeLocalValue(values.endTime);

    if (!startTime || !endTime) return;

    const payload: CreateScheduleCommand = {
      ...values,
      labRoomId: derivedLabRoomId,
      roomName:
        roomDetail?.roomName ?? values.roomName ?? schedule?.labRoomName ?? "",
      startTime,
      endTime,
    };

    await onSubmit(payload);
  };

  const patch = <K extends keyof CreateScheduleCommand>(
    key: K,
    value: CreateScheduleCommand[K],
  ) => {
    if (key === "labRoomId") {
      setUserTouchedRoomId(true);
    }

    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !isLoading && onClose()}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-gray-200/60 dark:border-gray-800/60">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/5" />

          <div className="relative px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <div
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg ${
                    mode === "create"
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30"
                      : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
                  }`}
                >
                  {mode === "create" ? (
                    <PlusCircle
                      className="h-7 w-7 text-white"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <PencilLine
                      className="h-7 w-7 text-white"
                      strokeWidth={2.5}
                    />
                  )}
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {mode === "create" ? "Add Schedule" : "Update Schedule"}
                    </h2>
                    {mode === "edit" && schedule?.id && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60">
                        <Calendar className="h-3 w-3" />
                        ID: {schedule.id}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {mode === "create"
                      ? "Create a new schedule session for the lab room"
                      : "Modify the schedule details and save changes"}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl p-2.5 text-gray-500 transition-all hover:bg-white/80 hover:text-gray-700 disabled:cursor-not-allowed dark:hover:bg-gray-800 dark:hover:text-gray-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
            {/* Lab Room ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <DoorOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Lab Room
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={derivedLabRoomId > 0 ? derivedLabRoomId : ""}
                  onChange={(e) =>
                    patch("labRoomId", Number(e.target.value) || 0)
                  }
                  className="h-12 w-full appearance-none rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pr-10 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                >
                  <option value="">Select a lab room</option>
                  {roomOptions.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomName}{" "}
                      {room.buildingName ? `(${room.buildingName})` : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Info Messages */}
              <div className="space-y-2">
                {mode === "edit" &&
                  !userTouchedRoomId &&
                  (!values.labRoomId || values.labRoomId <= 0) &&
                  resolvedLabRoomId != null && (
                    <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-2 border border-blue-200 dark:border-blue-500/30">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-blue-800 dark:text-blue-200">
                        Auto-filled from "{schedule?.labRoomName}" → #
                        {resolvedLabRoomId}
                      </span>
                    </div>
                  )}

                {mode === "edit" && schedule?.labRoomName && (
                  <div className="flex items-start gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2 border border-gray-200 dark:border-gray-700">
                    <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      Schedule room label:{" "}
                      <strong>{schedule.labRoomName}</strong>
                    </span>
                  </div>
                )}

                {mode === "edit" &&
                  (!schedule?.labRoomId || schedule.labRoomId <= 0) &&
                  isResolving && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Resolving room ID from lab directory...
                    </div>
                  )}

                {roomIdValid && roomDetailLoading && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading room details...
                  </div>
                )}

                {roomIdValid && roomDetail && (
                  <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-500/10 px-3 py-2 border border-green-200 dark:border-green-500/30">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-green-800 dark:text-green-200">
                      <strong>{roomDetail.roomName}</strong>
                      {roomDetail.buildingName && (
                        <> · {roomDetail.buildingName}</>
                      )}
                    </span>
                  </div>
                )}

                {errors.labRoomId && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 border border-red-200 dark:border-red-500/30">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-red-800 dark:text-red-200">
                      {errors.labRoomId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Subject ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Subject Name
              </label>
              <input
                type="text"
                value={values.subjectCode}
                onChange={(e) => patch("subjectCode", e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="e.g., CS101, MATH202"
              />
              {errors.subjectCode && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 border border-red-200 dark:border-red-500/30">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-red-800 dark:text-red-200">
                    {errors.subjectCode}
                  </span>
                </div>
              )}
            </div>

            {/* Time Range */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Start Time */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Start Time
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={values.startTime}
                  onChange={(e) => patch("startTime", e.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/10 [color-scheme:light] dark:[color-scheme:dark]"
                />
                {errors.startTime && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 border border-red-200 dark:border-red-500/30">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-red-800 dark:text-red-200">
                      {errors.startTime}
                    </span>
                  </div>
                )}
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  End Time
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={values.endTime ?? ""}
                  onChange={(e) => patch("endTime", e.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 [color-scheme:light] dark:[color-scheme:dark]"
                />
                {errors.endTime && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 border border-red-200 dark:border-red-500/30">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-red-800 dark:text-red-200">
                      {errors.endTime}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <Sparkles className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                Schedule Type
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.type}
                onChange={(e) => patch("type", e.target.value)}
                placeholder="e.g., LECTURE, LAB, WORKSHOP"
                className="h-12 w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
              />
              {errors.type && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 border border-red-200 dark:border-red-500/30">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-red-800 dark:text-red-200">
                    {errors.type}
                  </span>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Status
              </label>
              <div className="relative">
                <select
                  value={values.status}
                  onChange={(e) =>
                    patch("status", e.target.value as ScheduleStatus)
                  }
                  className="h-12 w-full appearance-none rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pr-10 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="NotYet">Not Yet</option>
                  <option value="Active">Active</option>
                  <option value="Finish">Finished</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Status Preview */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Preview:
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold border ${STATUS_CONFIG[values.status].color}`}
                >
                  {STATUS_CONFIG[values.status].label}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98] ${
                  mode === "create"
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-emerald-500/30 hover:from-emerald-700 hover:to-emerald-800"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    {mode === "create" ? (
                      <>
                        <PlusCircle className="h-4 w-4" />
                        Create Schedule
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
