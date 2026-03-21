// ===== DOMAIN =====
export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED";

export type UpdatableBookingStatus = "APPROVED" | "REJECTED";

export interface Booking {
  Id: string;
  LabRoomId: number;
  BuildingName: string;
  BookedByUserId: string;
  StartTime: string;
  EndTime: string;

  group_size: number;
  PurposeTypeName: string;
  Reason: string;

  BookingStatus: BookingStatus;
  BookingType?: string | null;

  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;

  IsWeeklyRecurring: boolean;
  RecurringUntil?: string | null;
}

// ===== API REQUEST =====
export interface GetBookingRequestsRequest {
  status?: BookingStatus;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  labRoomId?: number;
}

export interface GetBookingHistoryRequest {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  labRoomId?: number;
}

export interface GetBookingByScheduleIdRequest {
  scheduleId: string;
}

export interface UpdateBookingStatusRequest {
  status: UpdatableBookingStatus;
}
// ===== API RESPONSE =====
export interface GetBookingRequestsResponse {
  data: Booking[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GetBookingHistoryResponse {
  data: Booking[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GetBookingByIdResponse {
  data: Booking;
}

export interface GetBookingByScheduleIdResponse {
  data: Booking | null;
}

export interface UpdateBookingStatusResponse {
  data: Booking;
}
