/**
 * Attendance Feature Barrel Exports
 * BOLAB-30: QR Code Attendance System
 * BOLAB-31: Face Recognition Attendance System
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
} from './types/attendance.type';

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

// Face Detection Hooks
export {
  useCameraStream,
} from './hooks/useCameraStream';

export {
  useMl5FaceDetection,
} from './hooks/useMl5FaceDetection';

// Components
export {
  FaceScanContainer,
} from './components/FaceScanContainer';

// Mock Data (for testing - remove in production)
export {
  MOCK_QR_SESSION,
  MOCK_STUDENT_ATTENDANCE,
  MOCK_LECTURER_BOOKINGS,
} from './mocks/attendance.mock';
