import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { ScheduleDto } from "../types/schedule.type";
import type {
  CreateSchedulePayload,
  ScheduleManagementListParams,
  UpdateSchedulePayload,
  UpsertSlotTypePayload,
} from "../types/scheduleManagement.type";
import { unwrapData } from "../types/scheduleManagement.type";
import type { SlotType } from "../../slot/types/slot.types";

const SCHEDULES = "/schedules";
const SLOT_TYPES = "/SlotTypes";

const buildListParams = (params: ScheduleManagementListParams) => {
  const raw = params.status;
  const status =
    raw !== undefined && raw !== "" ? raw : undefined;

  return {
    labRoomId: params.labRoomId,
    subjectId: params.subjectId?.trim() || undefined,
    fromDate: params.fromDate || undefined,
    toDate: params.toDate || undefined,
    status,
    type: params.scheduleType?.trim() || undefined,
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
    sortBy: params.sortBy ?? "startTime",
    isDescending: params.isDescending ?? false,
  };
};

const normalizeSchedule = (raw: unknown): ScheduleDto =>
  unwrapData<ScheduleDto>(raw);

export const scheduleManagementApi = {
  getPaged: (params: ScheduleManagementListParams) =>
    axiosInstance
      .get<PagedResponse<ScheduleDto>>(SCHEDULES, {
        params: buildListParams(params),
      })
      .then((res) => res.data),

  create: (payload: CreateSchedulePayload) =>
    axiosInstance
      .post(SCHEDULES, {
        labRoomId: payload.labRoomId,
        subjectId: payload.subjectId,
        startTime: payload.startTime,
        endTime: payload.endTime,
        type: payload.type,
        status: payload.status,
      })
      .then((res) => normalizeSchedule(res.data)),

  update: (id: string, payload: UpdateSchedulePayload) =>
    axiosInstance
      .put(`${SCHEDULES}/${id}`, {
        labRoomId: payload.labRoomId,
        subjectId: payload.subjectId,
        startTime: payload.startTime,
        endTime: payload.endTime,
        type: payload.type,
        status: payload.status,
      })
      .then((res) => normalizeSchedule(res.data)),

  remove: (id: string) =>
    axiosInstance.delete(`${SCHEDULES}/${id}`).then(() => undefined),

  getSlotTypes: (campusId?: number) =>
    axiosInstance
      .get<SlotType[] | { data: SlotType[] }>(SLOT_TYPES, {
        params: campusId != null ? { campusId } : undefined,
      })
      .then((res) => {
        const raw = res.data;
        if (Array.isArray(raw)) return raw;
        return unwrapData<SlotType[]>(raw);
      }),

  createSlotType: (payload: UpsertSlotTypePayload) =>
    axiosInstance
      .post(SLOT_TYPES, payload)
      .then((res) => unwrapData<SlotType>(res.data)),

  updateSlotType: (id: number, payload: UpsertSlotTypePayload) =>
    axiosInstance
      .put(`${SLOT_TYPES}/${id}`, payload)
      .then((res) => unwrapData<SlotType>(res.data)),

  deleteSlotType: (id: number) =>
    axiosInstance.delete(`${SLOT_TYPES}/${id}`).then(() => undefined),
};
