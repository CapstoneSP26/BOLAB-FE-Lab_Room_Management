import { axiosInstance } from "../../../api";
import type {
  GetSlotTypesRequest,
  SlotType,
  GetSlotTypeByIdResponse,
} from "../types/slot.types";

export const slotApi = {
  getSlotTypes: (params?: GetSlotTypesRequest) =>
    axiosInstance
      .get<SlotType[]>("/SlotTypes", { params })
      .then((response) => response.data),

  getSlotTypeById: (id: number) =>
    axiosInstance
      .get<GetSlotTypeByIdResponse>(`/SlotTypes/${id}`)
      .then((response) => response.data.data),
};
