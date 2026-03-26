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

///////////////
export type SlotStatus = "Available" | "Booked" | "Pending" | "Maintenance";
export type BookingMode = "OldSlot" | "OutSlot";

export interface TimeSlot {
  id: string;
  roomId: string;
  date: string; // ISO 8601 format: YYYY-MM-DD
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  status: SlotStatus;
  userName?: string;
  bookedBy?: string;
  groupName?: string;
  slotType?: BookingMode; // OldSlot (fixed slots) or OutSlot (flexible booking)
  slotNumber?: number; // For OldSlot: slot 1, slot 2, etc.
  lecturerName?: string;
  scheduleType?: string;
  studentCount?: number;
  bookingSource?: "AO_BOOK" | "LECTURER_BOOK";
}
export interface GetSlotTypesRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  code?: string;
}
export interface GetAvailableSlotsRequest {
  roomId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}

export interface GetAvailableSlotsResponse {
  slots: TimeSlot[];
  total: number;
}
/** ===== SLOT LOOKUP RESPONSE ===== */
export interface GetSlotTypesResponse {
  data: SlotType[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GetSlotTypeByIdResponse {
  data: SlotType;
}

/** ===== AVAILABLE SLOTS REQUEST ===== */
export interface GetAvailableSlotsRequest {
  roomId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  slotTypeId?: number;
  slotTypeCode?: string;
}

/** ===== AVAILABLE SLOTS RESPONSE ===== */
export interface GetAvailableSlotsResponse {
  slots: TimeSlot[];
  total: number;
}
