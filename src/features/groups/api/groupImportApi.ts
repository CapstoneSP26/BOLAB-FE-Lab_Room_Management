/**
 * ===== DATA ACCESS LAYER (Group Import API) =====
 * Rules:
 * - Only use axiosInstance from src/api/axios
 * - Must define TypeScript Interface for both Request and Response
 * - Do NOT catch errors (UI or React Query handles them)
 * - All data comes from backend API
 */

import type {
  CommitGroupImportRequest,
  CommitGroupImportResponse,
  GroupImportDto,
  ImportValidationResult,
  ValidateGroupImportRequest,
} from "../types/importGroup.type";
import type { AxiosResponse } from "axios";
import axiosInstance from "../../../api/axios";

export const groupImportApi = {
  validateGroupImport: async (
    payload: ValidateGroupImportRequest,
  ): Promise<ImportValidationResult<GroupImportDto>> => {
    return axiosInstance
      .post<ImportValidationResult<GroupImportDto>>("/groups/import/validate", payload)
      .then((res: AxiosResponse<ImportValidationResult<GroupImportDto>>) => res.data);
  },

  commitGroupImport: async (
    payload: CommitGroupImportRequest,
  ): Promise<CommitGroupImportResponse> => {
    return axiosInstance
      .post<CommitGroupImportResponse>("/groups/import/commit", payload)
      .then((res: AxiosResponse<CommitGroupImportResponse>) => res.data);
  },
};
