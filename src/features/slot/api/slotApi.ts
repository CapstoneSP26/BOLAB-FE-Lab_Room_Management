import { axiosInstance } from "../../../api";
import type {
  SlotType,
  GetSlotTypeByIdResponse,
  UpsertSlotTypePayload,
} from "../types/slot.types";

const SLOT_API = {
  SLOT_TYPES: "/SlotTypes",
  SLOT_TYPE_BY_ID: (id: number) => `/SlotTypes/${id}`,
};

export const slotApi = {
  getSlotTypes: (campusId?: number) =>
    axiosInstance
      .get<SlotType[]>("/SlotTypes", { params: { campusId } })
      .then((response) => response.data),

  getSlotTypeById: (id: number) =>
    axiosInstance
      .get<GetSlotTypeByIdResponse>(`/SlotTypes/${id}`)
      .then((response) => response.data.data),
  createSlotType: (payload: UpsertSlotTypePayload) =>
    axiosInstance
      .post<SlotType>(SLOT_API.SLOT_TYPES, payload)
      .then((response) => response.data),

  updateSlotType: (id: number, payload: UpsertSlotTypePayload) =>
    axiosInstance
      .put<SlotType>(SLOT_API.SLOT_TYPE_BY_ID(id), payload)
      .then((response) => response.data),

  deleteSlotType: (id: number) =>
    axiosInstance.delete(SLOT_API.SLOT_TYPE_BY_ID(id)).then(() => undefined),
};
