export interface BookingDto {
  id: string;
  labRoomId: number;
  labRoomName: string;

  createdBy: string;
  userFullName: string;
  userEmail: string;
  userCode?: string;

  startTime: string;
  endTime: string;
  studentCount: number;
  reason?: string;

  status: string;
  createdAt: string;

  isOverdue?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
}

export interface GetBookingsParams {
  searchTerm?: string;
  status?: number;
  labRoomId?: number;
  fromDate?: string;
  toDate?: string;
  requestedBy?: string;

  pageNumber?: number;
  pageSize?: number;

  sortBy?: string;
  isDescending?: boolean;
}

export interface CreateBookingCommand {
  labRoomId: number;
  slotTypeId: number;
  purposeTypeId: number;
  startTime: string; // ISO String: "2024-03-26T07:30:00Z"
  endTime: string;
  studentCount: number;
  recurringCount: number;
  reason: string;
  groupIds?: string[]; // Hiện tại để optional hoặc []
}

export interface CreateBookingResponse {
  id: string; // Guid trả về từ Backend
}

export interface PurposeTypeDto {
  id: number;
  purposeName: string;
}

export interface PendingBooking {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  slotTypeId: number; // Để biết là đang đặt theo ca hay tự do
}

// ===== DOMAIN MODELS =====

export interface Booking {
  id: string | number;
  roomId: string | number;
  roomName: string;
  buildingName: string;
  startTime: string;
  endTime: string;
  date: string;
  status: BookingStatus;
  purpose?: string;
  userName?: string;
  lecturerName?: string;
  scheduleType?: string;
  studentCount?: number;
  bookingSource?: "AO_BOOK" | "LECTURER_BOOK";
  createdAt?: string;
}

export type BookingStatus =
  | "All"
  | "PendingApproval"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export interface BookingRequest {
  id: string | number;
  roomId: string | number;
  roomName: string;
  buildingName: string;
  requestedBy: string;
  requestedAt: string;
  startTime: string;
  endTime: string;
  date: string;
  studentCount?: number;
  status: string;
  purpose?: string;
}

export interface BookingStats {
  totalAccepted: number;
  totalPending: number;
  totalRejected: number;
  upcomingBookings: number;
}

// ===== API REQUEST TYPES =====

export interface GetUpcomingBookingsRequest {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetBookingStatsRequest {
  startDate?: string;
  endDate?: string;
}

export interface GetRecentRequestsRequest {
  page?: number;
  limit?: number;
}

export interface GetBookingHistoryRequest {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

// ===== API RESPONSE TYPES =====

export interface GetUpcomingBookingsResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface GetBookingStatsResponse {
  data: BookingStats;
}

export interface GetRecentRequestsResponse {
  data: BookingRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface GetBookingHistoryResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

///////////////////////thanh
export interface BookingRequestDraft {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  repeatWeekly: boolean;
  weeklyUntil?: string; // ISO 8601 date format
  groupId?: string;
  notes?: string;
}

export interface BookingSummary {
  id: string;
  roomName: string;
  building: string;
  date: string;
  startTime: string;
  endTime: string;
  repeatWeekly: boolean;
  weeklyUntil?: string;
  groupName?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

// ===== API REQUEST/RESPONSE TYPES =====
export type BookingStatusFilter = BookingStatus | "all";

export interface GetMyBookingsRequest {
  status?: "Pending" | "Approved" | "Rejected";
  startDate?: string;
  endDate?: string;
}

export interface GetMyBookingsResponse {
  bookings: BookingSummary[];
  total: number;
}

export interface GetBookingRequestsRequest {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  labRoomId?: number;
  buildingId?: number;
  keyword?: string;
  status?: BookingStatus;
  slotTypeId?: number;
  slotTypeCode?: string;
  sortBy?: string;
  isDescending?: boolean;
}

export interface GetBookingByScheduleIdRequest {
  scheduleId: string;
}

export interface GetBookingRequestsResponse {
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

export interface ApproveBookingRequestResponse {
  data: BookingRequest;
}

export interface RejectBookingRequestResponse {
  data: BookingRequest;
}

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
