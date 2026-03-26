import type {
  BookingRequest,
  BookingStatus,
} from "../../booking/types/booking.type";
export interface ScheduleDto {
  id: string;
  subjectCode: string;
  lecturerName: string;
  labRoomName: string;
  slotName: string;
  groupName?: string;
  startTime: string;
  endTime: string;

  studentCount: number;
  status: string;
  type: string;
}

export interface GetSchedulesParams {
  searchTerm?: string;
  status?: string;
  labRoomId?: number;
  lecturerId?: string;
  subjectCode?: string;
  fromDate?: string;
  toDate?: string;

  pageNumber?: number;
  pageSize?: number;

  sortBy?: string;
  isDescending?: boolean;
}

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
export interface GetBookingRequestsRequest {
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
