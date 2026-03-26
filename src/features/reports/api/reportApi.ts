import axiosInstance from "../../../api/axios";
import type {
  CreateReportRequest,
  CreateReportResponse,
  GetReportReasonsResponse,
  GetMyReportsRequest,
  GetMyReportsResponse,
  GetReportDetailRequest,
  ReportResolvedFilter,
  ReportHistorySortKey,
  GetReportDetailResponse,
} from "../types/report.type";
import {
  getResponseSuccess,
  normalizeReasonOptions,
} from "../types/report.mapper";

const REPORT_API = {
  CREATE: "/reports",
  REASONS: "/reports/reasons",
  MY_REPORTS: "/reports/my-reports",
  DETAIL: (id: string) => `/reports/${id}`,
  RESOLVE: (id: string) => `/reports/${id}/resolve`,
} as const;

type GetFilteredReportsParams = {
  q?: string;
  roomId?: number | "ALL";
  status?: ReportResolvedFilter;
  page?: number;
  limit?: number;
  sort?: ReportHistorySortKey;
};

const buildReportQueryParams = (
  params: GetFilteredReportsParams = {},
): GetMyReportsRequest => {
  return {
    q: params.q?.trim() || undefined,
    roomId: params.roomId === "ALL" ? undefined : params.roomId,
    isResolved:
      params.status === "ALL" ? undefined : params.status === "RESOLVED",
    page: params.page,
    limit: params.limit,
    sortBy: params.sort === "Room" ? "roomId" : "createdAt",
    isDescending: params.sort === "Oldest" ? false : true,
  };
};

export const createReport = async (
  data: CreateReportRequest,
): Promise<CreateReportResponse> => {
  const formData = new FormData();
  formData.append("roomId", data.roomId);
  formData.append("reason", data.reason);
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

export const getMyReports = async (
  params: GetMyReportsRequest = {},
): Promise<GetMyReportsResponse> => {
  const response = await axiosInstance.get<GetMyReportsResponse>(
    REPORT_API.MY_REPORTS,
    { params },
  );

  return response.data;
};

export const getFilteredReports = async (
  filters: GetFilteredReportsParams = {},
): Promise<GetMyReportsResponse> => {
  return getMyReports(buildReportQueryParams(filters));
};

export const getUnresolvedReports = async (
  params: Omit<GetMyReportsRequest, "isResolved"> = {},
): Promise<GetMyReportsResponse> => {
  return getMyReports({
    ...params,
    isResolved: false,
  });
};

export const getResolvedReports = async (
  params: Omit<GetMyReportsRequest, "isResolved"> = {},
): Promise<GetMyReportsResponse> => {
  return getMyReports({
    ...params,
    isResolved: true,
  });
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

export const resolveReport = async (reportId: string): Promise<Report> => {
  const response = await axiosInstance.patch<{ data: Report }>(
    REPORT_API.RESOLVE(reportId),
    {
      isResolved: true,
    },
  );

  return response.data.data;
};
