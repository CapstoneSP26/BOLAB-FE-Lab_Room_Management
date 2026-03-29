import { axiosInstance } from "../../../api";
import type {
  SlotType,
  GetSlotTypeByIdResponse,
} from "../types/slot.types";

export const slotApi = {
  getSlotTypes: (campusId?: number) =>
    axiosInstance
      .get<SlotType[]>("/SlotTypes", { params: { campusId } })
      .then((response) => response.data),

  getSlotTypeById: (id: number) =>
    axiosInstance
      .get<GetSlotTypeByIdResponse>(`/SlotTypes/${id}`)
      .then((response) => response.data.data),
};
