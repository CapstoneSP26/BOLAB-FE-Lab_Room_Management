export type CalendarMode = "PERSONAL" | "LAB_SPECIFIC" | "PUBLIC";

export interface UseCalendarEventProps {
  calendarMode: CalendarMode;
  labRoomId?: number; // Bắt buộc nếu mode là LAB_SPECIFIC hoặc PUBLIC
  startDate?: string;
  endDate?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: string;
  status: string;
  rawOrigin: any; // Giữ lại data gốc nếu cần hiển thị Modal chi tiết
  color?: string;
  slotName?: string; // Tên loại slot, dùng để hiển thị trong tooltip
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
