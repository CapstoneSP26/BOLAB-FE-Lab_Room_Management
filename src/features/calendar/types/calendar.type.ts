import type { ScheduleDto } from "../../schedules/types/schedule.type";

export type CalendarMode = "PERSONAL" | "LAB_SPECIFIC" | "PUBLIC";
export type ScheduleType = string;
export type ScheduleStatus = string;

export interface UseCalendarEventProps {
  calendarMode: CalendarMode;
  labRoomId?: number; // Bắt buộc nếu mode là LAB_SPECIFIC hoặc PUBLIC
  startDate?: string;
  endDate?: string;
}

export type LabCalendarEventProps = {
  schedule: ScheduleDto;
  status: string;
  roomName: string;
  buildingName: string;
};

export type RoomLookupItem = {
  id: number;
  roomName: string;
  buildingName: string;
};

export type ScheduleRoomOption = {
  roomName: string;
  buildingName: string;
  roomId?: number;
};

export type LabCalendarSelectOption = {
  value: string;
  label: string;
};

export type LabCalendarFilterState = {
  selectedRoom: string;
  selectedBuilding: string;
  selectedTimeRange: string;
  selectedStatus: string;
  selectedSlotType: string;
};

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: string;
  status: string;
  rawOrigin: unknown; // Giữ lại data gốc nếu cần hiển thị Modal chi tiết
  color?: string;
  slotName?: string; // Tên loại slot, dùng để hiển thị trong tooltip
  groupName?: string
}

export interface Schedule {
  Id: string;
  LecturerId: string;
  LabRoomId: number;

  ScheduleType: string;
  ScheduleStatus: string;
  BuildingName: string;
  StartTime: string;
  EndTime: string;

  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;

  IsActive: boolean;
  IsDeleted: boolean;
  FromAdmin: boolean;
}

export type IncidentStatus = "OPEN" | "CLOSED" | "RESOLVED" | string;
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;

// ===== DOMAIN =====
export interface Incident {
  Id: string;
  ReportId: string;

  LabRoomId: number;
  Title: string;
  Description: string;

  Severity: IncidentSeverity;
  Status: IncidentStatus;

  ResolvedAt?: string;
  ResolvedBy?: string;

  CreatedAt: string;
}

// ===== REQUEST =====
export interface AddIncidentFromReportRequest {
  ReportId: string;
  LabRoomId: number;
  Title: string;
  Description: string;
  Severity?: IncidentSeverity;
  ResolvedBy?: string;
  ResolvedAt?: string;
}

export interface GetIncidentByIdRequest {
  id: string;
}

export interface RemoveIncidentByReportIdRequest {
  reportId: string;
}

// ===== RESPONSE =====
export interface GetIncidentListResponse {
  data: Incident[];
}

export interface GetIncidentByIdResponse {
  data: Incident | null;
}

export interface AddIncidentFromReportResponse {
  data: Incident;
}

export interface RemoveIncidentByReportIdResponse {
  success: boolean;
}

export interface GetScheduleListResponse {
  data: ScheduleDto[];
}

export interface GetScheduleByIdResponse {
  data: ScheduleDto;
}

export interface UpdateScheduleStatusResponse {
  data: ScheduleDto;
}
