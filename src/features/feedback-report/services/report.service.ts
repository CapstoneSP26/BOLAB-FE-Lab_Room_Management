/**
 * Report Service
 * API integration layer for feedback and report operations
 */

import axiosInstance from '../../../api/axios';
import type {
  CreateReportRequest,
  CreateReportResponse,
  GetReportReasonsResponse,
  GetMyReportsRequest,
  GetMyReportsResponse,
  GetReportDetailRequest,
  GetReportDetailResponse,
  ReportReasonOption,
} from '../types';

// API endpoints
const REPORT_API = {
  CREATE: '/api/reports',
  REASONS: '/api/reports/reasons',
  MY_REPORTS: '/api/reports/my-reports',
  DETAIL: (id: string) => `/api/reports/${id}`,
} as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toReasonOption = (item: unknown): ReportReasonOption | null => {
  if (!isObject(item)) {
    return null;
  }

  const valueCandidate = item.value ?? item.id ?? item.code ?? item.reason;
  const labelCandidate = item.label ?? item.name ?? item.title ?? item.description;

  if (typeof valueCandidate !== 'string' || typeof labelCandidate !== 'string') {
    return null;
  }

  return {
    value: valueCandidate,
    label: labelCandidate,
  };
};

const normalizeReasonOptions = (payload: unknown): ReportReasonOption[] => {
  const source = isObject(payload) && Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];

  return source
    .map(toReasonOption)
    .filter((item): item is ReportReasonOption => item !== null);
};

/**
 * Create a new report
 * Uploads images and submits report data
 */
export const createReport = async (
  data: CreateReportRequest
): Promise<CreateReportResponse> => {
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('roomId', data.roomId);
  formData.append('reason', data.reason);
  formData.append('description', data.description);

  // Append images if provided
  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const response = await axiosInstance.post<CreateReportResponse>(
    REPORT_API.CREATE,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Get my reports with optional filters
 */
export const getMyReports = async (
  params: GetMyReportsRequest = {}
): Promise<GetMyReportsResponse> => {
  const response = await axiosInstance.get<GetMyReportsResponse>(
    REPORT_API.MY_REPORTS,
    { params }
  );
  return response.data;
};

/**
 * Get report reasons from backend
 */
export const getReportReasons = async (): Promise<GetReportReasonsResponse> => {
  const response = await axiosInstance.get(REPORT_API.REASONS);
  const raw = response.data;
  const success =
    isObject(raw) && typeof raw.success === 'boolean' ? raw.success : true;

  return {
    success,
    data: normalizeReasonOptions(raw),
  };
};

/**
 * Get report detail by ID
 */
export const getReportDetail = async (
  params: GetReportDetailRequest
): Promise<GetReportDetailResponse> => {
  const response = await axiosInstance.get<GetReportDetailResponse>(
    REPORT_API.DETAIL(params.reportId)
  );
  return response.data;
};
