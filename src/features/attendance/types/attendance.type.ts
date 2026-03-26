/**
 * Attendance Feature Types
 * BOLAB-30: QR Code Attendance System
 */

/**
 * Booking Status (from booking feature)
 */
export type BookingStatus = 'Draft' | 'PendingApproval' | 'Approved' | 'Rejected' | 'Cancelled';

/**
 * Attendance Status
 */
export type AttendanceStatus = 'present' | 'absent';

/**
 * Student Attendance Record
 */
export interface StudentAttendance {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  scanTime?: string; // ISO date string
  status: AttendanceStatus;
  ipAddress?: string;
  deviceInfo?: string;
}

/**
 * QR Code Session
 * Represents an active QR code for attendance
 */
export interface QRSession {
  id: string;
  bookingId: string;
  roomName: string;
  roomCode: string;
  buildingName: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  lecturerName: string;
  lecturerId: string;
  qrToken: string; // Unique token for QR code
  qrExpiry: string; // ISO date string
  qrImageUrl?: string;
  qrImageBase64?: string;
  createdAt: string;
  isActive: boolean;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
}

/**
 * Create QR Session Request
 */
export interface CreateQRSessionRequest {
  bookingId: string;
  expiryMinutes?: number; // Default: 5 minutes
}

/**
 * Create QR Session Response
 */
export interface CreateQRSessionResponse {
  success: boolean;
  message: string;
  data: QRSession;
}

/**
 * Get QR Session Response
 */
export interface GetQRSessionResponse {
  success: boolean;
  message: string;
  data: QRSession;
}

/**
 * Refresh QR Token Request
 */
export interface RefreshQRTokenRequest {
  sessionId: string;
  expiryMinutes?: number;
}

/**
 * Refresh QR Token Response
 */
export interface RefreshQRTokenResponse {
  success: boolean;
  message: string;
  data: {
    qrToken: string;
    qrExpiry: string;
    qrImageUrl?: string;
    qrImageBase64?: string;
  };
}

/**
 * End QR Session Request
 */
export interface EndQRSessionRequest {
  sessionId: string;
}

/**
 * End QR Session Response
 */
export interface EndQRSessionResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    isActive: boolean;
  };
}

/**
 * Get Attendance List Request
 */
export interface GetAttendanceListRequest {
  sessionId: string;
}

/**
 * Get Attendance List Response
 */
export interface GetAttendanceListResponse {
  success: boolean;
  message: string;
  data: {
    session: QRSession;
    students: StudentAttendance[];
  };
}

/**
 * Mark Attendance Request (for student scan)
 * Note: studentId and rollNumber are optional - backend will get from access token
 */
export interface MarkAttendanceRequest {
  sessionId: string;
  qrToken: string;
  studentId?: string; // Optional - backend gets from token if not provided
  rollNumber?: string; // Optional - backend gets from token if not provided
}

/**
 * Mark Attendance Response
 */
export interface MarkAttendanceResponse {
  success: boolean;
  message: string;
  data: StudentAttendance;
}

/**
 * Export Attendance Request
 */
export interface ExportAttendanceRequest {
  sessionId: string;
  format: 'csv' | 'excel' | 'pdf';
}

/**
 * Booking with QR Session info (for list)
 */
export interface BookingWithQR {
  bookingId: string;
  roomName: string;
  roomCode: string;
  buildingName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  purpose: string;
  hasQRSession: boolean;
  qrSessionId?: string;
  isUpcoming: boolean; // Can create QR for upcoming bookings
  isPast: boolean;
}

/**
 * Get Lecturer Bookings Response (for QR management)
 */
export interface GetLecturerBookingsResponse {
  success: boolean;
  message: string;
  data: BookingWithQR[];
}
