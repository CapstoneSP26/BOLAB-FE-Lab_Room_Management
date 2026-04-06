import type {
  CommitUserImportRequest,
  CommitUserImportResponse,
  UserImportDto,
  ImportValidationResult,
  ValidateUserImportRequest,
  EditableUserRow,
} from "../types/importUser.type";
import type { AxiosResponse } from "axios";
import axiosInstance from "../../../api/axios";

export const userImportApi = {
  validateUserImport: async (
    payload: ValidateUserImportRequest,
  ): Promise<ImportValidationResult<EditableUserRow, UserImportDto>> => {
    return axiosInstance
      .post<ImportValidationResult<EditableUserRow, UserImportDto>>(
        "/users/import/validate",
        payload
      )
      .then((res: AxiosResponse<ImportValidationResult<EditableUserRow, UserImportDto>>) => res.data);
  },

  commitUserImport: async (
    payload: CommitUserImportRequest,
  ): Promise<CommitUserImportResponse> => {
    return axiosInstance
      .post<CommitUserImportResponse>("/users/import/commit", payload)
      .then((res: AxiosResponse<CommitUserImportResponse>) => res.data);
  },
};
