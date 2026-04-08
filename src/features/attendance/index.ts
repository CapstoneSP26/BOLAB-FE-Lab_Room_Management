/**
 * Attendance Feature Exports
 * BOLAB-30: QR Code Attendance System
 */

// Types
export type {
  AttendanceStatus,
  AttendanceStudentDto,
  GetAttendanceListRequest,
  GetAttendanceListResponse,
  GenerateQRCodeRequest,
  GenerateQRCodeResponse,
  RemoveQRCodeRequest,
  RemoveQRCodeResponse,
  ScanQRCodeRequest,
  ScanQRCodeResponse,
  SubmitAttendanceCommand,
  SubmitAttendanceResponse,
  BookingWithQR,
} from './types/attendance.type';

// Hooks - QR Code Management
export {
  useGenerateQRCode,
  useRemoveQRCode,
  QR_CODE_KEYS,
} from './hooks/useQRSession';

// Hooks - QR Code Scanning
export {
  useScanQRCode,
} from './hooks/useEndQRSession';

// Hooks - Attendance List & Submission
export {
  useAttendanceList,
  useSubmitAttendance,
  ATTENDANCE_KEYS,
} from './hooks/useAttendance';

// Hooks - Management State
export {
  useAttendanceManagementState,
  DEFAULT_ATTENDANCE_SCHEDULE_PARAMS,
} from './hooks/useAttendanceManagementState';
