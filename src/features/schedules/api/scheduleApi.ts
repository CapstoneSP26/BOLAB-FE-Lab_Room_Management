import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { GetSchedulesParams, ScheduleDto } from "../types/schedule.type";

export const scheduleApi = {
  getSchedules: (params: GetSchedulesParams) =>
    axiosInstance.get<PagedResponse<ScheduleDto>>("/schedules", {
      params,
    }).then(res => res.data),
  getScheduleAttendance: (params: GetSchedulesParams) =>
    axiosInstance.get<PagedResponse<ScheduleDto>>("/schedules/schedule-attendance", {
      params,
    }),
  getPublicSchedule: (params: GetSchedulesParams) =>
    axiosInstance.get<PagedResponse<ScheduleDto>>("/public/calendar/labroom", {
      params,
    }).then(res => res.data),
};
