// ===== DOMAIN MODELS =====

export interface LabRoom {
  id: string;
  name: string;
  building: string;
  capacity: number;
  features: string[];
  image?: string;
}

export interface StudentGroup {
  id: string;
  name: string;
  courseCode: string;
  studentCount: number;
}

export type SlotStatus = 'Available' | 'Booked' | 'Pending' | 'Maintenance';
export type BookingMode = 'OldSlot' | 'OutSlot';

export interface TimeSlot {
  id: string;
  roomId: string;
  date: string; // ISO 8601 format: YYYY-MM-DD
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  status: SlotStatus;
  bookedBy?: string;
  groupName?: string;
  slotType?: BookingMode; // OldSlot (fixed slots) or OutSlot (flexible booking)
  slotNumber?: number; // For OldSlot: slot 1, slot 2, etc.
}

export interface BookingRequest {
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
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

// ===== API REQUEST/RESPONSE TYPES =====

export interface GetLabRoomsRequest {
  buildingId?: string;
  minCapacity?: number;
  features?: string[];
}

export interface GetLabRoomsResponse {
  rooms: LabRoom[];
  total: number;
}

export interface GetStudentGroupsRequest {
  lecturerId?: string;
}

export interface GetStudentGroupsResponse {
  groups: StudentGroup[];
  total: number;
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

export interface CreateBookingRequest {
  bookingData: BookingRequest;
}

export interface CreateBookingResponse {
  success: boolean;
  bookingId: string;
  summary: BookingSummary;
  message: string;
}

export interface GetMyBookingsRequest {
  status?: 'Pending' | 'Approved' | 'Rejected';
  startDate?: string;
  endDate?: string;
}

export interface GetMyBookingsResponse {
  bookings: BookingSummary[];
  total: number;
}
