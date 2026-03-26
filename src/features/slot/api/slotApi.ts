import { axiosInstance } from "../../../api";
import type { GetSlotTypesRequest, SlotType } from "../types/slot.types";

export const slotApi = {
  getSlotTypes: (params?: GetSlotTypesRequest) =>
    axiosInstance
      .get<SlotType[]>("/SlotTypes", { params })
      .then((response) => response.data),
};
