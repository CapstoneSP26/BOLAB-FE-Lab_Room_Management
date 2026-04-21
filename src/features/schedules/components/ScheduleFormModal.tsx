import { type FormEvent, useState, useCallback, useEffect } from "react";
import {
  Loader2,
  PencilLine,
  PlusCircle,
  X,
  Calendar,
  Clock,
  DoorOpen,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
} from "lucide-react";
import type { LabRoomDto } from "../../labroom/types/room.type";
import type {
  CreateScheduleCommand,
  ScheduleDto,
  ScheduleStatus,
  ScheduleType,
} from "../types/schedule.type";
import { fromDatetimeLocalValue } from "../../../utils/date.util";
import { defaultValues, STATUS_CONFIG } from "../utils/scheduleForm.utils";
import { SearchDropdown } from "../../../components/ui/SearchDropdown";
import { userManagementApi } from "../../users/api/userManagementApi";
import type { UserListItem } from "../../users/types/userManagement.type";

type Props = {
  isOpen: boolean;
  mode: "create" | "edit" | "view";
  schedule?: ScheduleDto | null;
  roomOptions: LabRoomDto[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateScheduleCommand) => Promise<void>;
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

  // ─── Room search state ───────────────────────────────────────────────
  const [roomQuery, setRoomQuery] = useState<string>(() => {
    if (schedule?.labRoomName) return schedule.labRoomName;
    return "";
  });
  const [roomResults, setRoomResults] = useState<LabRoomDto[]>([]);
  const [roomSearching, setRoomSearching] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<LabRoomDto | null>(null);

  // ─── Lecturer search state ───────────────────────────────────────────
  const [lecturerQuery, setLecturerQuery] = useState<string>(() => {
    if (schedule?.lecturerName) return schedule.lecturerName;
    return "";
  });
  const [lecturerResults, setLecturerResults] = useState<UserListItem[]>([]);
  const [lecturerSearching, setLecturerSearching] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<UserListItem | null>(null);

  // Đồng bộ lại dữ liệu khi schedule thay đổi (đặc biệt quan trọng khi đổi giữa các sự kiện trên Calendar)
  useEffect(() => {
    if (isOpen && schedule) {
      setValues(defaultValues(schedule));
      setRoomQuery(schedule.labRoomName || "");
      setLecturerQuery(schedule.lecturerName || "");
      setErrors({});
    } else if (!isOpen) {
      // Reset khi đóng modal
      setValues(defaultValues(null));
      setRoomQuery("");
      setLecturerQuery("");
    }
  }, [isOpen, schedule]);

  // ─── Room search ─────────────────────────────────────────────────────
  const handleRoomSearch = useCallback((q: string) => {
    setRoomQuery(q);
    if (!q.trim()) {
      setRoomResults([]);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = roomOptions.filter(
      (r) =>
        r.roomName.toLowerCase().includes(lower) ||
        r.roomNo?.toLowerCase().includes(lower) ||
        r.buildingName?.toLowerCase().includes(lower),
    );
    setRoomResults(filtered);
  }, [roomOptions]);

  const handleRoomSelect = (room: LabRoomDto) => {
    setSelectedRoom(room);
    setRoomQuery(`${room.roomName}${room.buildingName ? ` (${room.buildingName})` : ""}`);
    setRoomResults([]);
    setValues((prev) => ({ ...prev, labRoomId: room.id, roomName: room.roomName }));
    setErrors((prev) => ({ ...prev, labRoomId: undefined }));
  };

  // ─── Lecturer search ─────────────────────────────────────────────────
  const handleLecturerSearch = useCallback(async (q: string) => {
    setLecturerQuery(q);
    if (!q.trim()) {
      setLecturerResults([]);
      return;
    }
    setLecturerSearching(true);
    try {
      const res = await userManagementApi.getUsers({
        q,
        role: "LECTURER",
        limit: 10,
      });
      setLecturerResults(res.items ?? []);
    } catch {
      setLecturerResults([]);
    } finally {
      setLecturerSearching(false);
    }
  }, []);

  const handleLecturerSelect = (user: UserListItem) => {
    setSelectedLecturer(user);
    setLecturerQuery(user.fullName);
    setLecturerResults([]);
    setValues((prev) => ({ ...prev, lecturerId: user.id }));
    setErrors((prev) => ({ ...prev, lecturerId: undefined }));
  };

  if (!isOpen) return null;

  // ─── validation ──────────────────────────────────────────────────────
  const validate = () => {
    const next: Partial<Record<keyof CreateScheduleCommand, string>> = {};

    if (!values.labRoomId || values.labRoomId <= 0) {
      next.labRoomId = "Valid lab room is required.";
    }
    if (!values.startTime) {
      next.startTime = "Start time is required.";
    }
    if (!values.endTime) {
      next.endTime = "End time is required.";
    }
    if (values.startTime && values.endTime) {
      const s = fromDatetimeLocalValue(values.startTime);
      const e = fromDatetimeLocalValue(values.endTime);
      if (s && e && new Date(s) >= new Date(e)) {
        next.endTime = "End must be after start.";
      }
    }
    if (!values.type) {
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
      startTime,
      endTime,
    };

    await onSubmit(payload);
  };

  const patch = <K extends keyof CreateScheduleCommand>(
    key: K,
    value: CreateScheduleCommand[K],
  ) => {
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
                      : mode === "edit"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
                      : "bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30"
                  }`}
                >
                  {mode === "create" ? (
                    <PlusCircle
                      className="h-7 w-7 text-white"
                      strokeWidth={2.5}
                    />
                  ) : mode === "edit" ? (
                    <PencilLine className="h-7 w-7 text-white" strokeWidth={2.5} />
                  ) : (
                    <Calendar className="h-7 w-7 text-white" strokeWidth={2.5} />
                  )}
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {mode === "create" ? "Add Schedule" : mode === "edit" ? "Update Schedule" : "Schedule Details"}
                    </h2>
                    {(mode === "edit" || mode === "view") && schedule?.id && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60">
                        <Calendar className="h-3 w-3" />
                        ID: {schedule.id}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {mode === "create"
                      ? "Create a new schedule session for the lab room"
                      : mode === "edit"
                      ? "Modify the schedule details and save changes"
                      : "Viewing detailed information about this schedule session"}
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
              <SearchDropdown<LabRoomDto>
                label=""
                placeholder="Search by room name, number or building..."
                value={roomQuery}
                onSearch={(q) => {
                  setRoomSearching(true);
                  handleRoomSearch(q);
                  setRoomSearching(false);
                }}
                results={roomResults}
                isSearching={roomSearching}
                getKey={(r) => String(r.id)}
                renderResult={(r) => (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {r.roomName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {r.roomNo && <span className="mr-2">#{r.roomNo}</span>}
                      {r.buildingName}
                    </span>
                  </div>
                )}
                onSelect={handleRoomSelect}
                onClear={() => {
                  setSelectedRoom(null);
                  setValues((prev) => ({ ...prev, labRoomId: 0, roomName: "" }));
                }}
                disabled={mode === "view"}
                error={errors.labRoomId}
              />
              {selectedRoom && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-500/30 dark:bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-800 dark:text-green-200">
                    <strong>{selectedRoom.roomName}</strong>
                    {selectedRoom.buildingName && <> · {selectedRoom.buildingName}</>}
                    {" "}(ID: {selectedRoom.id})
                  </span>
                </div>
              )}
            </div>

            {/* Lecturer — search dropdown */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Lecturer
              </label>
              <SearchDropdown<UserListItem>
                label=""
                placeholder="Search by full name, user code or email..."
                value={lecturerQuery}
                onSearch={(q) => void handleLecturerSearch(q)}
                results={lecturerResults}
                isSearching={lecturerSearching}
                getKey={(u) => u.id}
                renderResult={(u) => (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {u.fullName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {u.userCode} · {u.email}
                    </span>
                  </div>
                )}
                onSelect={handleLecturerSelect}
                onClear={() => {
                  setSelectedLecturer(null);
                  setValues((prev) => ({ ...prev, lecturerId: undefined }));
                }}
                disabled={mode === "view"}
                error={errors.lecturerId}
              />
              {selectedLecturer && (
                <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 dark:border-teal-500/30 dark:bg-teal-500/10">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-medium text-teal-800 dark:text-teal-200">
                    <strong>{selectedLecturer.fullName}</strong>
                    {" "}· {selectedLecturer.userCode} · {selectedLecturer.email}
                  </span>
                </div>
              )}
            </div>

            {/* Subject ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Subject Code
              </label>
              <input
                type="text"
                value={values.subjectCode}
                onChange={(e) => patch("subjectCode", e.target.value)}
                className={`h-12 w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${mode === 'view' ? 'opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                placeholder="e.g., CS101, MATH202"
                disabled={mode === "view"}
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
                  className={`h-12 w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/10 [color-scheme:light] dark:[color-scheme:dark] ${mode === 'view' ? 'opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                  disabled={mode === "view"}
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
                  className={`h-12 w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 [color-scheme:light] dark:[color-scheme:dark] ${mode === 'view' ? 'opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                  disabled={mode === "view"}
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
              <div className="relative">
                <select
                  value={values.type}
                  onChange={(e) => patch("type", e.target.value as ScheduleType)}
                  className={`h-12 w-full appearance-none rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pr-10 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 ${mode === 'view' ? 'opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                  disabled={mode === "view"}
                >
                  <option value="Academic">Academic</option>
                  <option value="Personal">Personal</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Examination">Examination</option>
                  <option value="Event">Event</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
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
                  className={`h-12 w-full appearance-none rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pr-10 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${mode === 'view' ? 'opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                  disabled={mode === "view"}
                >
                  <option value="Active">Active</option>
                  <option value="InProcess">In Process</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Preview:</span>
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold border ${STATUS_CONFIG[values.status].color}`}>
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
                {mode === "view" ? "Close" : "Cancel"}
              </button>

              {mode !== "view" && (
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
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}