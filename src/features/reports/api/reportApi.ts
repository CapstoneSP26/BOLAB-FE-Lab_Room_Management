import axiosInstance from "../../../api/axios";
import type {
  CreateReportRequest,
  CreateReportResponse,
  GetMyReportsRequest,
  GetMyReportsResponse,
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
import type {
  LabRoomDto,
  LabRoomLookupItem,
} from "../../labroom/types/room.type";
import { labroomApi } from "../../labroom/api/labroom.api";
const REPORT_API = {
  CREATE: "/reports",
  REASONS: "/reports/reasons",
  MY_REPORTS: "/reports/my-reports",
  DETAIL: (id: string) => `/reports/${id}`,
  RESOLVE: (id: string) => `/reports/${id}/resolve`,
} as const;

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

/** Lookup: rooms for report filter */
export const getRoomOptions = async (): Promise<LabRoomLookupItem[]> => {
  const response = await labroomApi.getRooms({
    pageNumber: 1,
    pageSize: 1000,
    includeBuilding: true,
    isDescending: false,
  });

  const items: LabRoomDto[] = response.items ?? [];

  return items.map((item: LabRoomDto) => ({
    id: item.id,
    roomName: item.roomName,
    roomNo: item.roomNo,
    buildingId: item.buildingId,
    buildingName: item.buildingName,
  }));
};
