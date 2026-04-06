import { type FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, PencilLine, PlusCircle, X } from "lucide-react";
import { useResolveLabRoomIdForSchedule } from "../../labroom/hooks/useLabRoomLookup";
import { useLabRoomDetail } from "../../labroom/hooks/useLabRooms";
import type { ScheduleDto } from "../types/schedule.type";
import type {
  CreateSchedulePayload,
  ScheduleSessionStatus,
} from "../types/scheduleManagement.type";
import { mapApiStatusToUi } from "../types/scheduleManagement.type";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "../../../utils/date.util";

export type ScheduleFormValues = {
  labRoomId: string;
  subjectId: string;
  startLocal: string;
  endLocal: string;
  type: string;
  status: ScheduleSessionStatus;
};

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  schedule?: ScheduleDto | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSchedulePayload) => Promise<void>;
};

function defaultValues(schedule?: ScheduleDto | null): ScheduleFormValues {
  if (!schedule) {
    return {
      labRoomId: "",
      subjectId: "",
      startLocal: "",
      endLocal: "",
      type: "",
      status: "NotYet",
    };
  }

  const uiStatus = mapApiStatusToUi(
    schedule.status || "",
  ) as ScheduleSessionStatus;
  const status: ScheduleSessionStatus =
    uiStatus === "NotYet" || uiStatus === "Active" || uiStatus === "Finish"
      ? uiStatus
      : "NotYet";

  const initialLabRoomId =
    schedule.labRoomId != null && schedule.labRoomId > 0
      ? String(schedule.labRoomId)
      : "";
  const initialSubjectId = (
    schedule.subjectId ??
    schedule.subjectCode ??
    ""
  ).trim();

  return {
    labRoomId: initialLabRoomId,
    subjectId: initialSubjectId,
    startLocal: toDatetimeLocalValue(schedule.startTime),
    endLocal: toDatetimeLocalValue(schedule.endTime),
    type: schedule.type ?? "",
    status,
  };
}

export default function ScheduleFormModal({
  isOpen,
  mode,
  schedule,
  isLoading = false,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ScheduleFormValues>(() =>
    defaultValues(schedule),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof ScheduleFormValues, string>>
  >({});
  const lookupAppliedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setValues(defaultValues(schedule));
      setErrors({});
    }
  }, [isOpen, schedule]);

  useEffect(() => {
    if (!isOpen) {
      lookupAppliedRef.current = false;
    }
  }, [isOpen]);

  const { resolvedLabRoomId, isResolving } = useResolveLabRoomIdForSchedule({
    labRoomId: schedule?.labRoomId,
    labRoomName: schedule?.labRoomName,
    enabled: isOpen && mode === "edit" && !!schedule,
  });

  useEffect(() => {
    if (!isOpen || mode !== "edit" || !schedule) return;
    if (schedule.labRoomId != null && schedule.labRoomId > 0) return;
    if (lookupAppliedRef.current) return;
    if (resolvedLabRoomId != null) {
      setValues((v) =>
        v.labRoomId === "" ? { ...v, labRoomId: String(resolvedLabRoomId) } : v,
      );
      lookupAppliedRef.current = true;
    }
  }, [isOpen, mode, schedule, resolvedLabRoomId]);

  const roomIdParsed = Number.parseInt(values.labRoomId, 10);
  const roomIdValid = Number.isFinite(roomIdParsed) && roomIdParsed > 0;
  const { data: roomDetail, isFetching: roomDetailLoading } = useLabRoomDetail(
    roomIdValid ? roomIdParsed : undefined,
    { enabled: isOpen && roomIdValid },
  );

  if (!isOpen) {
    return null;
  }

  const validate = () => {
    const next: typeof errors = {};
    if (!values.labRoomId.trim() || Number(values.labRoomId) <= 0) {
      next.labRoomId = "Valid lab room ID is required.";
    }
    if (!values.subjectId.trim()) {
      next.subjectId = "Subject ID is required.";
    }
    if (!values.startLocal) {
      next.startLocal = "Start time is required.";
    }
    if (!values.endLocal) {
      next.endLocal = "End time is required.";
    }
    if (values.startLocal && values.endLocal) {
      const a = fromDatetimeLocalValue(values.startLocal);
      const b = fromDatetimeLocalValue(values.endLocal);
      if (a && b && new Date(a) >= new Date(b)) {
        next.endLocal = "End must be after start.";
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

    const startTime = fromDatetimeLocalValue(values.startLocal);
    const endTime = fromDatetimeLocalValue(values.endLocal);
    if (!startTime || !endTime) return;

    const payload: CreateSchedulePayload = {
      labRoomId: Number(values.labRoomId),
      subjectId: values.subjectId.trim(),
      startTime,
      endTime,
      type: values.type.trim(),
      status: values.status,
    };

    await onSubmit(payload);
  };

  const patch = <K extends keyof ScheduleFormValues>(
    key: K,
    v: ScheduleFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-300">
              {mode === "create" ? (
                <PlusCircle className="h-5 w-5" />
              ) : (
                <PencilLine className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === "create" ? "Add schedule" : "Update schedule"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === "edit"
                  ? `ID: ${schedule?.id ?? ""}`
                  : "Create a new session."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Lab room ID
            </span>
            <input
              type="number"
              min={1}
              value={values.labRoomId}
              onChange={(e) => patch("labRoomId", e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
            {mode === "edit" && schedule?.labRoomName ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Schedule room label: {schedule.labRoomName}
              </span>
            ) : null}
            {mode === "edit" &&
            (!schedule?.labRoomId || schedule.labRoomId <= 0) &&
            isResolving ? (
              <span className="text-xs text-brand-600 dark:text-brand-400">
                Resolving room id from lab directory…
              </span>
            ) : null}
            {roomIdValid && roomDetailLoading ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Loading room details…
              </span>
            ) : null}
            {roomIdValid && roomDetail ? (
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {roomDetail.roomName}
                {roomDetail.buildingName ? ` · ${roomDetail.buildingName}` : ""}
              </span>
            ) : null}
            {errors.labRoomId ? (
              <span className="text-xs text-red-600">{errors.labRoomId}</span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Subject ID
            </span>
            <input
              type="text"
              value={values.subjectId}
              onChange={(e) => patch("subjectId", e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
            {errors.subjectId ? (
              <span className="text-xs text-red-600">{errors.subjectId}</span>
            ) : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Start
              </span>
              <input
                type="datetime-local"
                value={values.startLocal}
                onChange={(e) => patch("startLocal", e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
              {errors.startLocal ? (
                <span className="text-xs text-red-600">
                  {errors.startLocal}
                </span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                End
              </span>
              <input
                type="datetime-local"
                value={values.endLocal}
                onChange={(e) => patch("endLocal", e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
              {errors.endLocal ? (
                <span className="text-xs text-red-600">{errors.endLocal}</span>
              ) : null}
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Schedule type
            </span>
            <input
              type="text"
              value={values.type}
              onChange={(e) => patch("type", e.target.value)}
              placeholder="e.g. LECTURE"
              className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
            {errors.type ? (
              <span className="text-xs text-red-600">{errors.type}</span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Status
            </span>
            <select
              value={values.status}
              onChange={(e) =>
                patch("status", e.target.value as ScheduleSessionStatus)
              }
              className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              <option value="NotYet">Not yet</option>
              <option value="Active">Active</option>
              <option value="Finish">Finish</option>
            </select>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
