/**
 * Report Service
 * API integration layer for feedback and report operations
 */

import axiosInstance from '../../../config/axios';
import type {
  CreateReportRequest,
  CreateReportResponse,
  GetMyReportsRequest,
  GetMyReportsResponse,
  GetReportDetailRequest,
  GetReportDetailResponse,
} from '../types';

// API endpoints
const REPORT_API = {
  CREATE: '/api/reports',
  MY_REPORTS: '/api/reports/my-reports',
  DETAIL: (id: string) => `/api/reports/${id}`,
} as const;

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
