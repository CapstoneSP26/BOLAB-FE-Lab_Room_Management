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

export interface CreateReportRequest {
  roomId: string;
  reason: string;
  description: string;
  images?: File[]; // Files to upload
}

export interface GetReportReasonsResponse {
  success: boolean;
  data: ReportReasonOption[];
}

export interface CreateReportResponse {
  success: boolean;
  message: string;
  data: Report;
}

export interface GetMyReportsRequest {
  status?: ReportStatus;
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

export interface GetReportDetailRequest {
  reportId: string;
}

export interface GetReportDetailResponse {
  success: boolean;
  data: Report;
}

export interface ImagePreview {
  id: string;
  file: File;
  preview: string;
}

export type ReportType = "USER" | "LAB_ROOM" | "BOOKING" | "INCIDENT";
export type ReportResolvedFilter = "ALL" | "RESOLVED" | "UNRESOLVED";
export type ReportHistorySortKey = "Newest" | "Oldest" | "Room";

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}
export interface Report {
  Id: string;
  ScheduleId?: string | null;
  UserId: string;
  ReportType: ReportType;
  Description: string;
  IsResolved: boolean;
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

export interface CreateReportRequest {
  roomId: string;
  reason: string;
  description: string;
  images?: File[];
}

export interface GetReportReasonsResponse {
  success: boolean;
  data: ReportReasonOption[];
}

export interface CreateReportResponse {
  success: boolean;
  message: string;
  data: Report;
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

export interface GetReportDetailRequest {
  reportId: string;
}

export interface GetReportDetailResponse {
  success: boolean;
  data: Report;
}
