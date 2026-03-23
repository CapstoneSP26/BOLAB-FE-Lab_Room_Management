import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { GetSchedulesParams, ScheduleDto } from "../types/schedule.type";

export const scheduleApi = {
  getSchedules: (params: GetSchedulesParams) =>
    axiosInstance.get<PagedResponse<ScheduleDto>>('/schedules', {
      params,
    }),
};