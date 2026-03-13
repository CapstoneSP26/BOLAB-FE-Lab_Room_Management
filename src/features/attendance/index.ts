/**
 * Attendance Feature Barrel Exports
 * BOLAB-30: QR Code Attendance System
 */

// Types
export type {
  AttendanceStatus,
  StudentAttendance,
  QRSession,
  CreateQRSessionRequest,
  CreateQRSessionResponse,
  GetQRSessionResponse,
  RefreshQRTokenRequest,
  RefreshQRTokenResponse,
  EndQRSessionRequest,
  EndQRSessionResponse,
  GetAttendanceListRequest,
  GetAttendanceListResponse,
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  ExportAttendanceRequest,
  BookingWithQR,
  GetLecturerBookingsResponse,
} from './types';

// Hooks
export {
  useCreateQRSession,
  useQRSession,
  useRefreshQRToken,
  QR_SESSION_KEYS,
} from './hooks/useQRSession';

export {
  useEndQRSession,
} from './hooks/useEndQRSession';

export {
  useAttendanceList,
  useMarkAttendance,
  useLecturerBookings,
  useExportAttendance,
  ATTENDANCE_KEYS,
} from './hooks/useAttendance';

// Services
export {
  createQRSession,
  getQRSession,
  refreshQRToken,
  endQRSession,
  getAttendanceList,
  markAttendance,
  getLecturerBookings,
  exportAttendance,
} from './services/attendance.service';

// Mock Data (for testing - remove in production)
export {
  MOCK_QR_SESSION,
  MOCK_STUDENT_ATTENDANCE,
  MOCK_LECTURER_BOOKINGS,
} from './mocks/attendance.mock';
