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

// ===== DOMAIN =====

/** Backend trả gì thì FE nhận string đó */
export type BookingStatus = string;
export type UpdatableBookingStatus = string;
export type BookingSlotTypeCode = string;
export type HistoryStatus = "ALL" | BookingStatus;
export interface Booking {
  Id: string;
  LabRoomId: number;
  BuildingName: string;
  BookedByUserId: string;
  StartTime: string;
  EndTime: string;

  StudentCount: number;
  PurposeTypeName: string;
  Reason: string;

  BookingStatus: BookingStatus;
  BookingType?: string | null;

  SlotTypeId?: number;
  SlotTypeCode?: BookingSlotTypeCode;
  SlotTypeName?: string;

  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;
  Recur: number;
}

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
  buildingName?: string;
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
  buildingName?: string;
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
