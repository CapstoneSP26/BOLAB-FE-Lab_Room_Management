import { create } from "zustand";
import type { SlotType, SlotFrame } from "../features/slot/types/slot.types";

interface SlotState {
  slotTypes: SlotType[];
  setSlotTypes: (types: SlotType[]) => void;
  // Helper để lấy nhanh SlotFrame theo ID mà không cần loop nhiều
  getSlotFrameById: (frameId: number) => SlotFrame | undefined;
}

export const useSlotStore = create<SlotState>((set, get) => ({
  slotTypes: [],
  setSlotTypes: (types) => set({ slotTypes: types }),

  getSlotFrameById: (frameId: number) => {
    for (const type of get().slotTypes) {
      const frame = type.slotFrames.find(f => f.id === frameId);
      if (frame) return frame;
    }
    return undefined;
  }
}));