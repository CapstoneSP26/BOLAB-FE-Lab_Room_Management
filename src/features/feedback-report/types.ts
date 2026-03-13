/**
 * Feedback & Report Feature Types
 * Domain models and API contracts for lab room reporting
 */

// ============================================================================
// Domain Models
// ============================================================================

/**
 * Report reason options
 */
export type ReportReason =
  | 'equipment_damaged'
  | 'equipment_missing'
  | 'cleanliness_issue'
  | 'air_conditioning_problem'
  | 'lighting_problem'
  | 'furniture_damaged'
  | 'network_issue'
  | 'projector_problem'
  | 'door_lock_issue'
  | 'other';

/**
 * Report reason display labels
 */
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  equipment_damaged: 'Thiết bị hư hỏng',
  equipment_missing: 'Thiết bị mất',
  cleanliness_issue: 'Vấn đề vệ sinh',
  air_conditioning_problem: 'Điều hòa không hoạt động',
  lighting_problem: 'Vấn đề chiếu sáng',
  furniture_damaged: 'Bàn ghế hư hỏng',
  network_issue: 'Mất kết nối mạng',
  projector_problem: 'Máy chiếu hỏng',
  door_lock_issue: 'Khóa cửa hỏng',
  other: 'Khác',
};

/**
 * Report status
 */
export type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  rejected: 'Từ chối',
};

/**
 * Report entity
 */
export interface Report {
  id: string;
  roomId: string;
  roomName: string;
  buildingName: string;
  reason: ReportReason;
  description: string;
  images: string[]; // Array of image URLs
  status: ReportStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolverNote?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Create report request
 */
export interface CreateReportRequest {
  roomId: string;
  reason: ReportReason;
  description: string;
  images?: File[]; // Files to upload
}

/**
 * Create report response
 */
export interface CreateReportResponse {
  success: boolean;
  message: string;
  data: Report;
}

/**
 * Get my reports request
 */
export interface GetMyReportsRequest {
  status?: ReportStatus;
  page?: number;
  limit?: number;
}

/**
 * Get my reports response
 */
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

/**
 * Get report detail request
 */
export interface GetReportDetailRequest {
  reportId: string;
}

/**
 * Get report detail response
 */
export interface GetReportDetailResponse {
  success: boolean;
  data: Report;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Image preview item
 */
export interface ImagePreview {
  id: string;
  file: File;
  preview: string; // Data URL for preview
}
