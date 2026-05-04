import { toDatetimeLocalValue } from "../../../utils/date.util";
import type {
  CreateScheduleCommand,
  ScheduleDto,
  ScheduleStatus,
  ScheduleType,
} from "../types/schedule.type";

export function defaultValues(schedule?: ScheduleDto | null): CreateScheduleCommand {
  if (!schedule) {
    return {
      labRoomId: 0,
      roomName: "",
      slotTypeId: undefined,
      subjectId: "",
      subjectCode: "",
      startTime: "",
      endTime: "",
      type: "Academic" as ScheduleType,
      status: "Active" as ScheduleStatus,
    };
  }

  // Handle parsing enum from either string or number from the API
  let mappedStatus: ScheduleStatus = "Active";
  const rawStatus = String(schedule.status);
  if (rawStatus === "1" || rawStatus === "Active") mappedStatus = "Active";
  else if (rawStatus === "2" || rawStatus === "InProcess") mappedStatus = "InProcess";
  else if (rawStatus === "3" || rawStatus === "Completed") mappedStatus = "Completed";
  else if (rawStatus === "4" || rawStatus === "Cancelled") mappedStatus = "Cancelled";

  let mappedType: ScheduleType = "Academic";
  const rawType = String(schedule.type || "");
  if (rawType === "1" || rawType === "Academic") mappedType = "Academic";
  else if (rawType === "2" || rawType === "Personal") mappedType = "Personal";
  else if (rawType === "3" || rawType === "Maintenance") mappedType = "Maintenance";
  else if (rawType === "4" || rawType === "Examination") mappedType = "Examination";
  else if (rawType === "5" || rawType === "Event") mappedType = "Event";

  return {
    labRoomId: schedule.labRoomId ?? 0,
    roomName: schedule.labRoomName ?? "",
    slotTypeId: undefined,
    subjectId: (schedule.subjectId ?? "").trim(),
    subjectCode: (schedule.subjectCode ?? "").trim(),
    lecturerId: schedule.lecturerId,
    groupId: schedule.groupId,
    startTime: toDatetimeLocalValue(schedule.startTime),
    endTime: schedule.endTime ? toDatetimeLocalValue(schedule.endTime) : "",
    type: mappedType,
    status: mappedStatus,
  };
}

export const STATUS_CONFIG: Record<ScheduleStatus, { label: string; color: string }> = {
  Active: {
    label: "Active",
    color:
      "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30",
  },
  InProcess: {
    label: "In Process",
    color:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  },
  Completed: {
    label: "Completed",
    color:
      "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500/30",
  },
  Cancelled: {
    label: "Cancelled",
    color:
      "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30",
  },
};