/**
 * ===== DATA ACCESS LAYER (LabRoom Import API) =====
 * Rules:
 * - Only use axiosInstance from src/api/axios
 * - Must define TypeScript Interface for both Request and Response
 * - Do NOT catch errors (UI or React Query handles them)
 * - All data comes from backend API
 */

import type {
  CommitLabRoomImportRequest,
  CommitLabRoomImportResponse,
  LabRoomImportDto,
  ImportValidationResult,
  ValidateLabRoomImportRequest,
} from "../types/importLabRoom.type";
import type { AxiosResponse } from "axios";
import axiosInstance from "../../../api/axios";

export const labRoomImportApi = {
  validateLabRoomImport: async (
    payload: ValidateLabRoomImportRequest,
  ): Promise<ImportValidationResult<LabRoomImportDto>> => {
    return axiosInstance
      .post<ImportValidationResult<LabRoomImportDto>>("/labroom/import/validate", payload)
      .then((res: AxiosResponse<ImportValidationResult<LabRoomImportDto>>) => res.data);
  },

  commitLabRoomImport: async (
    payload: CommitLabRoomImportRequest,
  ): Promise<CommitLabRoomImportResponse> => {
    return axiosInstance
      .post<CommitLabRoomImportResponse>("/labroom/import/commit", payload)
      .then((res: AxiosResponse<CommitLabRoomImportResponse>) => res.data);
  },
};
