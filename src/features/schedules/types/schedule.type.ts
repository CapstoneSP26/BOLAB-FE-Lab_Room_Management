export type ScheduleStatus =
  | "Active"
  | "InProcess"
  | "Completed"
  | "Cancelled";
export type ScheduleType = "Academic" | "Personal" | "Maintenance" | "Examination" | "Event";
export interface ScheduleDto {
  id: string;
  labRoomId?: number;
  labRoomName: string;
  roomNo?: string;
  subjectId?: string;
  subjectCode: string;
  buildingName?: string;
  lecturerName: string;
  lecturerId?: string;
  userCode?: string;
  slotName: string;
  groupId?: string;
  groupName?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  studentCount: number;
  status: ScheduleStatus;
  type: string;
  schedulePriority?: number; // 1: Normal, 2: Academic, 3: School Event (dùng để sắp xếp ưu tiên hiển thị)
}

export interface GetSchedulesParams {
  buildingId?: number;
  searchItems?: string;
  status?: ScheduleStatus | "";
  labRoomId?: number | "";
  lecturerId?: string;
  subjectId?: string;
  subjectCode?: string;
  fromDate?: string;
  toDate?: string;
  type?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
}

export interface GetSchedulesFilters {
  buildingId: number | "ALL";
  labRoomId: number | "ALL";
  fromDate: string;
  toDate: string;
  status: ScheduleStatus | "";
  scheduleType: string;
  q: string;
}

export interface CreateScheduleCommand {
  labRoomId: number;
  roomName?: string;
  slotTypeId?: number;
  subjectId?: string;
  subjectCode: string;
  lecturerId?: string;
  groupName?: string;
  startTime: string;
  endTime: string;
  type: string;
  status: ScheduleStatus;
}

export interface UpdateScheduleCommand {
  labRoomId?: number;
  roomName?: string;
  slotTypeId?: number;
  subjectId?: string;
  subjectCode: string;
  lecturerId?: string;
  groupName?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  status?: ScheduleStatus;
}

export interface CreateScheduleResponse {
  id: string;
}

export interface UpdateScheduleResponse {
  data: ScheduleDto;
}

export interface GetScheduleByIdResponse {
  data: ScheduleDto;
}

export function getScheduleTypeValue(schedule: ScheduleDto): string {
  const type = schedule.type != null ? String(schedule.type).trim() : "";
  const slotName = schedule.slotName != null ? String(schedule.slotName).trim() : "";
  return type || slotName || "Unknown";
}
