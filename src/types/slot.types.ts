export interface SlotFrame {
  id: number;
  startTime: string; // "HH:mm:ss" từ backend
  endTime: string;
  orderIndex: number;
}

export interface SlotType {
  id: number;
  code: string;
  name: string;
  slotFrames: SlotFrame[];
}