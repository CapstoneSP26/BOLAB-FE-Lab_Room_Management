/**
 * Attendance Feature Types
 * BOLAB-30: QR Code Attendance System
 * Aligned with Backend API
 */

import type { ScheduleStatus } from '../../schedules/types/schedule.type';

/**
 * Booking Status
 * Normalized for UI so we can display both backend states and derived states.
 */
export type BookingStatus = ScheduleStatus | 'Available' | 'Done';

/**
 * Attendance Status
 */
export type AttendanceStatus = 'Present' | 'Absent';

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
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: string;
}

/**
 * Scan QR Code Response
 */
export interface ScanQRCodeResponse {
  success: boolean;
  message: string;
  approved?: boolean;
  denied?: boolean;
  reason?:
    | 'INVALID_QR'
    | 'EXPIRED_QR'
    | 'SESSION_NOT_ACTIVE'
    | 'OUTSIDE_CAMPUS'
    | 'LOW_LOCATION_ACCURACY'
    | 'REPLAY_DETECTED'
    | 'ALREADY_MARKED'
    | 'TIME_WINDOW_CLOSED'
    | 'LOCATION_PERMISSION_DENIED'
    | 'LOCATION_UNAVAILABLE'
    | 'MOCK_LOCATION_SUSPECTED';
  campusDistanceMeters?: number;
  campusRadiusMeters?: number;
  minAccuracyMeters?: number;
}

/**
 * Submit Attendance Request
 */
export interface SubmitAttendanceCommand {
  scheduleId: string;
  attendanceItems: Array<{
    userId: string;  // Changed from studentId to userId
    status: number;  // 0 = Present, 1 = Absent
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
  status: BookingStatus;
  purpose: string;
  hasQRSession: boolean;
  qrSessionId?: string;
  isUpcoming: boolean;
  isPast: boolean;
}

/**
 * ============================================
 * BOLAB-31: Face Recognition Types
 * ============================================
 */

/**
 * Face Recognition Result
 * Returned from POST /api/attendance/recognize-face
 */
export interface FaceRecognitionResult {
  success: boolean;
  studentId: string;
  date: string; // ISO format
  image?: string; // base64 encoded image
  confidence?: number; // 0-1
}

/**
 * Detected Face from face-api.js
 */
export interface DetectedFace {
  confidence: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Face Scan Result
 */
export interface FaceScanResult {
  success: boolean;
  faces: DetectedFace[];
  isNewFace: boolean;
  faceId?: string;
}


