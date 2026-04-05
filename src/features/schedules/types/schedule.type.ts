export interface ScheduleDto {
  id: string;
  /** Khi backend trả kèm — dùng để bind form / cập nhật lịch */
  labRoomId?: number;
  /** Id môn học (nếu API trả riêng; nếu không có thể map từ subjectCode) */
  subjectId?: string;
  subjectCode: string;
  lecturerName: string;
  labRoomName: string;
  userCode?: string;
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

export type BookingStatus =
  | "Draft"
  | "PendingApproval"
  | "APPROVED"
  | "REJECTED";

/**
 * Schedule Status (session state)
 */
export type ScheduleStatus = 'Active' | 'NotYet' | 'Done';

export type UpdatableBookingStatus = "APPROVED" | "REJECTED";
export type BookingSlotTypeCode = "OLD_SLOT" | "NEW_SLOT" | "OUT_SLOT";
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
// export interface GetBookingHistoryRequest {
//   page?: number;
//   limit?: number;
//   startDate?: string;
//   endDate?: string;
//   labRoomId?: number;
//   buildingName?: string;
//   keyword?: string;
//   slotTypeId?: number;
//   slotTypeCode?: BookingSlotTypeCode;
// }
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
