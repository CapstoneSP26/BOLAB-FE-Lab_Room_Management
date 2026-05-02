/**
 * Attendance Feature Exports
 * BOLAB-30: QR Code Attendance System
 * BOLAB-31: Face Recognition Attendance System
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
  FaceRecognitionResult,
  DetectedFace,
  FaceScanResult,
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

// Hooks - Face Recognition (NEW - BOLAB-31)
export {
  useCameraStream,
} from './hooks/useCameraStream';

export {
  useMl5FaceDetection,
} from './hooks/useMl5FaceDetection';

// Components - Face Recognition (NEW - BOLAB-31)
export {
  FaceScanContainer,
} from './components/FaceScanContainer';
