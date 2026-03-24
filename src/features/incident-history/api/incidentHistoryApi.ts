import axiosInstance from "../../../api/axios";
import type {
  AddIncidentFromReportRequest,
  AddIncidentFromReportResponse,
  GetIncidentByIdResponse,
  GetIncidentListResponse,
  RemoveIncidentByReportIdResponse,
} from "../type";

/**
 * ===== DATA ACCESS LAYER =====
 * Rules:
 * - Chỉ dùng axiosInstance
 * - Phải định nghĩa TypeScript Interface cho cả Request và Response
 * - Không được catch error (để UI hoặc React Query xử lý)
 */

const INCIDENT_API = {
  LIST: "/incidents", // GET
  BY_ID: (id: string) => `/incidents/${id}`, // GET
  ADD_FROM_REPORT: "/incidents/from-report", // POST
  REMOVE_BY_REPORT_ID: (reportId: string) =>
    `/incidents/report/${reportId}`, // DELETE
};

/** Get all incidents */
export const getIncidentList = async (): Promise<GetIncidentListResponse> => {
  const response = await axiosInstance.get<GetIncidentListResponse>(
    INCIDENT_API.LIST,
  );
  return response.data;
};

/** Get incident by id */
export const getIncidentById = async (
  id: string,
): Promise<GetIncidentByIdResponse> => {
  const response = await axiosInstance.get<GetIncidentByIdResponse>(
    INCIDENT_API.BY_ID(id),
  );
  return response.data;
};

/** Add incident from report */
export const addIncidentFromReport = async (
  body: AddIncidentFromReportRequest,
): Promise<AddIncidentFromReportResponse> => {
  const response = await axiosInstance.post<AddIncidentFromReportResponse>(
    INCIDENT_API.ADD_FROM_REPORT,
    body,
  );
  return response.data;
};

/** Remove incident by reportId */
export const removeIncidentByReportId = async (
  reportId: string,
): Promise<RemoveIncidentByReportIdResponse> => {
  const response = await axiosInstance.delete<RemoveIncidentByReportIdResponse>(
    INCIDENT_API.REMOVE_BY_REPORT_ID(reportId),
  );
  return response.data;
};
