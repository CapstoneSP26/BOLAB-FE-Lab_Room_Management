import type { PagedResponse } from "../../../types/pagination.types";
import {
  getScheduleTypeValue,
  type ScheduleDto,
} from "../../schedules/types/schedule.type";
import type {
  GetScheduleByIdResponse,
  GetScheduleListResponse,
  Schedule,
  UpdateScheduleStatusResponse,
} from "../types/calendar.type";

export const mapScheduleDtoToCalendarSchedule = (dto: ScheduleDto): Schedule => ({
  Id: dto.id,
  LecturerId: dto.userCode ?? "",
  LabRoomId: 0,
  ScheduleType: getScheduleTypeValue(dto),
  ScheduleStatus: dto.status ?? "",
  BuildingName: "",
  StartTime: dto.startTime,
  EndTime: dto.endTime,
  CreatedAt: dto.startTime,
  UpdatedAt: dto.endTime,
  CreatedBy: dto.lecturerName ?? "",
  UpdatedBy: dto.lecturerName ?? "",
  IsActive: true,
  IsDeleted: false,
  FromAdmin: false,
});

export const mapScheduleListResponse = (
  payload: PagedResponse<ScheduleDto> | GetScheduleListResponse,
): Schedule[] => {
  const rawItems =
    "items" in payload
      ? payload.items
      : Array.isArray(payload.data)
        ? payload.data
        : [];

  return rawItems.map((item) => mapScheduleDtoToCalendarSchedule(item));
};

export const mapScheduleDetailResponse = (
  payload: GetScheduleByIdResponse | UpdateScheduleStatusResponse,
): Schedule => {
  return mapScheduleDtoToCalendarSchedule(payload.data);
};
