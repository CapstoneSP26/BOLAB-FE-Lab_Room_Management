import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { ScheduleDto } from "../../schedules/types/schedule.type";
import type {
  GetScheduleByIdResponse,
  Schedule,
  UpdateScheduleStatusResponse,
} from "../types/calendar.type";
import {
  mapScheduleDetailResponse,
  mapScheduleListResponse,
} from "../utils/calendar.mapper";

const SCHEDULE_API = {
  LIST: "/schedules",
  BY_ID: (id: string) => `/schedules/${id}`,
  APPROVE: (id: string) => `/schedules/${id}/approve`,
  REJECT: (id: string) => `/schedules/${id}/reject`,
} as const;

export const labSchedulerApi = {
  async list(): Promise<Schedule[]> {
    const response = await axiosInstance.get<PagedResponse<ScheduleDto>>(
      SCHEDULE_API.LIST,
      {
        params: {
          pageNumber: 1,
          pageSize: 1000,
          sortBy: "startTime",
          isDescending: false,
        },
      },
    );

    return mapScheduleListResponse(response.data);
  },

  async getById(id: string): Promise<Schedule | null> {
    const response = await axiosInstance.get<GetScheduleByIdResponse>(
      SCHEDULE_API.BY_ID(id),
    );

    if (!response.data?.data) {
      return null;
    }

    return mapScheduleDetailResponse(response.data);
  },

  async approve(id: string): Promise<Schedule> {
    const response = await axiosInstance.patch<UpdateScheduleStatusResponse>(
      SCHEDULE_API.APPROVE(id),
    );

    return mapScheduleDetailResponse(response.data);
  },

  async reject(id: string): Promise<Schedule> {
    const response = await axiosInstance.patch<UpdateScheduleStatusResponse>(
      SCHEDULE_API.REJECT(id),
    );

    return mapScheduleDetailResponse(response.data);
  },
};
