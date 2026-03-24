import { axiosInstance } from "../../../api";
import type { SlotType } from "../types/slot.types";

export const slotApi = {
  getSlotTypes: (campusId?: number) =>
    axiosInstance.get<SlotType[]>("/SlotTypes", { params: { campusId } }),
};