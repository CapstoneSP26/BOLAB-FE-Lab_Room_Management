export type ScheduleStatus =
  | "Active"
  | "InProcess"
  | "Completed"
  | "Cancelled"
  | "NotYet"
  | "Finish"
  | "Done";

export interface ScheduleDto {
  id: string;
  labRoomId?: number;
  subjectId?: string;
  subjectCode: string;
  lecturerName: string;
  labRoomName: string;
  userCode?: string;
  slotName: string;
  groupName?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  studentCount: number;
  status: ScheduleStatus;
  type: string;
}

export interface GetSchedulesParams {
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
}

export interface CreateScheduleCommand {
  labRoomId: number;
  roomName?: string;
  slotTypeId?: number;
  subjectId?: string;
  subjectCode: string;
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
  // return schedule.type?.trim() || schedule.slotName?.trim() || "Unknown";
  return "Academic"
}
