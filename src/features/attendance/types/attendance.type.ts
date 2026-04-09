/**
 * Attendance Feature Types
 * BOLAB-30: QR Code Attendance System
 * Aligned with Backend API
 */

import type { ScheduleStatus } from '../../schedules/types/schedule.type';

/**
 * Attendance Status
 */
export type AttendanceStatus = 'present' | 'absent' | 'late';

/**
 * Student Attendance Record
 * Returned from GET /api/attendances/schedule/{scheduleId}
 */
export interface AttendanceStudentDto {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  scanTime?: string; // ISO date string
}

/**
 * Get Attendance List Request
 */
export interface GetAttendanceListRequest {
  scheduleId: string;
}

/**
 * Get Attendance List Response
 */
export interface GetAttendanceListResponse {
  success?: boolean;
  data?: AttendanceStudentDto[];
}

/**
 * Generate QR Code Request
 */
export interface GenerateQRCodeRequest {
  scheduleId: string;
  isCheckIn: boolean;
}

/**
 * Generate QR Code Response
 * Returns base64 PNG image
 */
export interface GenerateQRCodeResponse {
  success: boolean;
  data: string; // base64 PNG image
}

/**
 * Remove QR Code Request
 */
export interface RemoveQRCodeRequest {
  scheduleId: string;
  isCheckIn: boolean;
}

/**
 * Remove QR Code Response
 */
export interface RemoveQRCodeResponse {
  success: boolean;
  data: string; // empty or status
}

/**
 * Scan QR Code Request
 */
export interface ScanQRCodeRequest {
  qrId: string;
  scheduleId: string;
  studentId: string;
  isCheckIn: boolean;
}

/**
 * Scan QR Code Response
 */
export interface ScanQRCodeResponse {
  success: boolean;
  message: string;
}

/**
 * Submit Attendance Request
 */
export interface SubmitAttendanceCommand {
  scheduleId: string;
  attendanceItems: Array<{
    userId: string;  // Changed from studentId to userId
    status: AttendanceStatus;
  }>;
}

/**
 * Submit Attendance Response
 */
export interface SubmitAttendanceResponse {
  message?: string;
  success?: boolean;
}

/**
 * Booking with QR Session info (for UI list)
 * Frontend-only type for rendering available bookings
 */
export interface BookingWithQR {
  bookingId: string;
  roomName: string;
  roomCode: string;
  buildingName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  purpose: string;
  hasQRSession: boolean;
  qrSessionId?: string;
  isUpcoming: boolean;
  isPast: boolean;
}


