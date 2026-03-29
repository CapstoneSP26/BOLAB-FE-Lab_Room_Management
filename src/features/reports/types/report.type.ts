export interface ReportReasonOption {
  value: string;
  label: string;
}

export const REPORT_REASON_LABELS: Record<string, string> = {
  equipment_damaged: "Thiết bị hư hỏng",
  equipment_missing: "Thiết bị mất",
  cleanliness_issue: "Vấn đề vệ sinh",
  air_conditioning_problem: "Điều hòa không hoạt động",
  lighting_problem: "Vấn đề chiếu sáng",
  furniture_damaged: "Bàn ghế hư hỏng",
  network_issue: "Mất kết nối mạng",
  projector_problem: "Máy chiếu hỏng",
  door_lock_issue: "Khóa cửa hỏng",
  other: "Khác",
};

export const FALLBACK_REPORT_REASONS: ReportReasonOption[] = Object.entries(
  REPORT_REASON_LABELS,
).map(([value, label]) => ({ value, label }));

export type ReportStatus = "pending" | "in_progress" | "resolved" | "rejected";

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Chờ xử lý",
  in_progress: "Đang xử lý",
  resolved: "Đã giải quyết",
  rejected: "Từ chối",
};

// Map reason string keys to ReportTypeId (1-9)
export const REPORT_REASON_TYPE_ID_MAP: Record<string, number> = {
  equipment_damaged: 1,
  equipment_missing: 2,
  cleanliness_issue: 3,
  air_conditioning_problem: 4,
  lighting_problem: 5,
  furniture_damaged: 6,
  network_issue: 7,
  door_lock_issue: 8,
  projector_problem: 9, // Map to "Other" (9)
  other: 9,
};

export interface ReportDraft {
  id: string;
  roomId: string;
  roomName: string;
  buildingName: string;
  reason: string;
  description: string;
  images: string[]; // Array of image URLs
  status: ReportStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolverNote?: string;
}

export interface Report {
  Id: string;
  ScheduleId?: string | null;
  UserId: string;

  ReportType?: string;
  Description: string;
  IsResolved: boolean;

  LabRoomId?: number;
  RoomName?: string;
  BuildingName?: string;
  Reason?: string;

  CreatedAt: string;
  UpdatedAt?: string | null;
  CreatedBy?: string | null;
  UpdatedBy?: string | null;
}

export interface ReportImage {
  Id: number;
  ReportId: string;
  ImageLink: string;
  Size: number;
  FileType: string;
}

export interface ReportReasonLookupItem {
  value: string;
  label: string;
}

export interface GetReportReasonLookupResponse {
  data: ReportReasonLookupItem[];
  total?: number;
  page?: number;
  limit?: number;
}

//request
export interface CreateReportRequest {
  roomId: string;
  reason: string;
  description: string;
  images?: File[]; // Files to upload
}

export interface GetMyReportsRequest {
  q?: string;
  roomId?: number;
  isResolved?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  isDescending?: boolean;
}
export interface GetReportDetailRequest {
  reportId: string;
}
export interface GetReportsRequest {
  q?: string;
  buildingId?: number;
  roomId?: number;
  reportType?: string;
  isResolved?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  isDescending?: boolean;
}
export interface GetReportHistoryRequest {
  q?: string;
  buildingId?: number;
  roomId?: number;
  reportType?: string;
  isResolved?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  isDescending?: boolean;
}

export interface ResolveReportRequest {
  isResolved: boolean;
}

////response
export interface GetReportReasonsResponse {
  success: boolean;
  data: ReportReasonOption[];
}

export interface CreateReportResponse {
  success: boolean;
  message: string;
  data: Report;
}
export interface GetReportsResponse {
  data: Report[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GetReportHistoryResponse {
  data: Report[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GetMyReportsResponse {
  success: boolean;
  data: {
    reports: Report[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetReportDetailResponse {
  success: boolean;
  data: Report & {
    images?: ReportImage[];
  };
}

export interface ResolveReportResponse {
  data: Report;
}

export interface ImagePreview {
  id: string;
  file: File;
  preview: string;
}
