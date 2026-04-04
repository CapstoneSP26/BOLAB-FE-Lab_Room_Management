import type {
  CommitImportCommand,
  CommitScheduleImportResponse,
  ScheduleImportDto,
  ImportValidationResult,
  ValidateImportQuery,
} from "../types/importBooking.type";
import type { AxiosResponse } from "axios";
import axiosInstance from "../../../api/axios";

export const bookingImportApi = {
  validateScheduleImport: async (
    payload: ValidateImportQuery,
  ): Promise<ImportValidationResult<ScheduleImportDto>> => {
    return axiosInstance
      .post<ImportValidationResult<ScheduleImportDto>>("/schedules/import/validate", payload)
      .then((res: AxiosResponse<ImportValidationResult<ScheduleImportDto>>) => res.data);
  },

  commitScheduleImport: async (
    payload: CommitImportCommand,
  ): Promise<CommitScheduleImportResponse> => {
    return axiosInstance
      .post<CommitScheduleImportResponse>("/schedules/import/commit", payload)
      .then((res: AxiosResponse<CommitScheduleImportResponse>) => res.data);
  },
};
