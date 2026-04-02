import type { BookingRequest, BookingStatus } from "./booking.type";

export type UpdatableBookingStatus = string;
export type BookingSlotTypeCode = string;
export type HistoryStatus = "ALL" | BookingStatus;

// ===== LOOKUP FROM BACKEND =====

export interface BookingStatusLookupItem {
  code: string;
  name: string;
}

export interface GetBookingStatusLookupResponse {
  data: BookingStatusLookupItem[];
  total?: number;
  page?: number;
  limit?: number;
}

// ===== API REQUEST =====
export interface GetBookingRequests {
  status?: BookingStatus;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  labRoomId?: number;
  buildingId?: number;
  keyword?: string;
  slotTypeId?: number;
  slotTypeCode?: BookingSlotTypeCode;
}

export interface GetBookingHistoryRequest {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  labRoomId?: number;
  buildingId?: number;
  keyword?: string;
  status?: BookingStatus;
  slotTypeId?: number;
  slotTypeCode?: BookingSlotTypeCode;
}

export interface GetBookingByScheduleIdRequest {
  scheduleId: string;
}

export interface UpdateBookingStatusRequest {
  status: UpdatableBookingStatus;
}

// ===== API RESPONSE =====
export interface GetBookingRequestsResponse {
  data: BookingRequest[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GetBookingHistoryResponse {
  data: BookingRequest[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GetBookingByIdResponse {
  data: BookingRequest;
}

export interface GetBookingByScheduleIdResponse {
  data: BookingRequest | null;
}

export interface UpdateBookingStatusResponse {
  data: BookingRequest;
}
