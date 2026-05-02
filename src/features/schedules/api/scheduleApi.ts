import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type {
  ScheduleDto,
  GetSchedulesParams,
  CreateScheduleCommand,
  CreateScheduleResponse,
  UpdateScheduleCommand,
  UpdateScheduleResponse,
  GetScheduleByIdResponse,
} from "../types/schedule.type";
const SCHEDULE_API = {
  SCHEDULES: "/schedules",
  SCHEDULE_ATTENDANCE: "/schedules/schedule-attendance",
  BY_ID: (id: string) => `/schedules/${id}`,
  SLOT_TYPES: "/SlotTypes",
  SLOT_TYPE_BY_ID: (id: number) => `/SlotTypes/${id}`,
};

export const scheduleApi = {
  getSchedules: (params: GetSchedulesParams) =>
    axiosInstance
      .get<PagedResponse<ScheduleDto>>("/schedules", {
        params,
      })
      .then((res) => res.data),

  getPublicSchedules: (params: GetSchedulesParams) =>
    axiosInstance
      .get<PagedResponse<ScheduleDto>>("/public/calendar/labroom", {
        params,
      })
      .then((res) => res.data),

  getScheduleAttendance: (params: GetSchedulesParams) =>
    axiosInstance
      .get<PagedResponse<ScheduleDto>>("/schedules/schedule-attendance", {
        params,
      })
      .then((res) => res.data),

  getSchedulesStudent: (params: GetSchedulesParams) =>
    axiosInstance
      .get<{ items: ScheduleDto[] }>("/schedules/schedule-student", {
        params,
      })
      .then((res) => res.data),

  getScheduleById: (id: string) =>
    axiosInstance
      .get<GetScheduleByIdResponse>(SCHEDULE_API.BY_ID(id))
      .then((res) => res.data),

  /**
   * Get current active schedules in a room
   * GET /api/schedules/current_schedule/{roomNo}
   * @param roomNo - Room number (e.g., "A101")
   */
  getCurrentSchedule: (roomNo: string) =>
    axiosInstance
      .get<{ result: ScheduleDto[] }>(`/schedules/current_schedule/${roomNo}`)
      .then((res) => res.data.result),

  getCurrentScheduleInRoom: (roomNo: string) =>
    axiosInstance
      .get<{ result: ScheduleDto[] }>(`/schedules/current_schedule/${roomNo}`)
      .then((res) => res.data.result),

  createSchedule: (payload: CreateScheduleCommand) =>
    axiosInstance
      .post<CreateScheduleResponse>(SCHEDULE_API.SCHEDULES, payload)
      .then((res) => res.data),

  updateSchedule: (id: string, payload: UpdateScheduleCommand) =>
    axiosInstance
      .put<UpdateScheduleResponse>(SCHEDULE_API.BY_ID(id), payload)
      .then((res) => res.data),

  deleteSchedule: (id: string) =>
    axiosInstance.delete(SCHEDULE_API.BY_ID(id)).then(() => undefined),
};
