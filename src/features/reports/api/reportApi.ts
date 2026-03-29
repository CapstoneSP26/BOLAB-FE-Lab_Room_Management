import axiosInstance from "../../../api/axios";
import type {
  CreateReportRequest,
  CreateReportResponse,
  GetReportsRequest,
  GetReportsResponse,
  GetMyReportsRequest,
  GetMyReportsResponse,
  GetReportHistoryRequest,
  GetReportHistoryResponse,
  GetReportDetailRequest,
  GetReportDetailResponse,
  GetReportReasonsResponse,
  ResolveReportRequest,
  ResolveReportResponse,
} from "../types/report.type";
import {
  getResponseSuccess,
  normalizeReasonOptions,
} from "../types/report.mapper";

const REPORT_API = {
  LIST: "/listreports",
  CREATE: "/reports",
  REASONS: "/reports/reasons",
  HISTORY: "/reports/history",
  MY_REPORTS: "/reports/my-reports",
  DETAIL: (id: string) => `/reports/${id}`,
  RESOLVE: (id: string) => `/reports/${id}/resolve`,
} as const;

// Map reason string keys to ReportTypeId (1-9)
const REASON_TO_TYPE_ID: Record<string, number> = {
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

export const createReport = async (
  data: CreateReportRequest,
): Promise<CreateReportResponse> => {
  const formData = new FormData();
  formData.append("roomId", data.roomId);
  
  // Convert reason string to reportTypeId (1-9)
  const reportTypeId = REASON_TO_TYPE_ID[data.reason] || 9;
  formData.append("reportTypeId", reportTypeId.toString());
  
  formData.append("description", data.description);

  if (data.images?.length) {
    data.images.forEach((image) => {
      formData.append("images", image);
    });
  }

  const response = await axiosInstance.post<CreateReportResponse>(
    REPORT_API.CREATE,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const getReports = async (
  params: GetReportsRequest = {},
): Promise<GetReportsResponse> => {
  const response = await axiosInstance.get<GetReportsResponse>(
    REPORT_API.LIST,
    { params },
  );

  return response.data;
};

export const getMyReports = async (
  params: GetMyReportsRequest = {},
): Promise<GetMyReportsResponse> => {
  const response = await axiosInstance.get<GetMyReportsResponse>(
    REPORT_API.MY_REPORTS,
    { params },
  );

  return response.data;
};
export const getReportHistory = async (
  params: GetReportHistoryRequest = {},
): Promise<GetReportHistoryResponse> => {
  const response = await axiosInstance.get<GetReportHistoryResponse>(
    REPORT_API.HISTORY,
    { params },
  );

  return response.data;
};

export const getReportReasons = async (): Promise<GetReportReasonsResponse> => {
  const response = await axiosInstance.get(REPORT_API.REASONS);
  const raw = response.data;

  return {
    success: getResponseSuccess(raw),
    data: normalizeReasonOptions(raw),
  };
};

export const getReportDetail = async (
  params: GetReportDetailRequest,
): Promise<GetReportDetailResponse> => {
  const response = await axiosInstance.get<GetReportDetailResponse>(
    REPORT_API.DETAIL(params.reportId),
  );

  return response.data;
};

export const resolveReport = async (
  id: string,
  body: ResolveReportRequest,
): Promise<ResolveReportResponse> => {
  const response = await axiosInstance.patch<ResolveReportResponse>(
    REPORT_API.RESOLVE(id),
    body,
  );

  return response.data;
};
