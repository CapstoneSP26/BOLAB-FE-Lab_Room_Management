import { axiosInstance } from '../../../api';
import type {
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
} from '../types/attendance.type';

/**
 * API endpoints
 * Aligned with Backend API
 */
const ATTENDANCE_API = {
  GET_ATTENDANCE_LIST: (scheduleId: string) => `/attendances/schedule/${scheduleId}`,
  SUBMIT_ATTENDANCE: '/attendances/submit',
  GENERATE_QR_CODE: '/attendances/generate-qrcode',
  SCAN_QR_CODE: '/attendances/scan-qrcode',
  REMOVE_QR_CODE: '/attendances/remove-qrcode',
} as const;

export const attendanceApi = {
  /**
   * Get list of students for attendance based on Schedule
   * GET /api/attendances/schedule/{scheduleId}
   */
  getAttendanceList: (params: GetAttendanceListRequest) =>
    axiosInstance.get<GetAttendanceListResponse>(
      ATTENDANCE_API.GET_ATTENDANCE_LIST(params.scheduleId),
    ).then(res => res.data),

  /**
   * Submit or update the attendance list for a specific schedule
   * POST /api/attendances/submit
   */
  submitAttendance: (command: SubmitAttendanceCommand) =>
    axiosInstance.post<SubmitAttendanceResponse>(
      ATTENDANCE_API.SUBMIT_ATTENDANCE,
      command,
    ).then(res => res.data),

  /**
   * Generate a QR code image for attendance
   * GET /api/attendances/generate-qrcode?scheduleId={scheduleId}&isCheckIn={isCheckIn}
   */
  generateQRCode: (params: GenerateQRCodeRequest) =>
    axiosInstance.get<GenerateQRCodeResponse>(
      ATTENDANCE_API.GENERATE_QR_CODE,
      { params },
    ).then(res => res.data),

  /**
   * Scan a QR code for attendance
   * GET /api/attendances/scan-qrcode?qrId={qrId}&scheduleId={scheduleId}&studentId={studentId}&isCheckIn={isCheckIn}
   *
   * FE only gathers data; BE decides approval/denial.
   */
  scanQRCode: (params: ScanQRCodeRequest) =>
    axiosInstance.get<ScanQRCodeResponse>(
      ATTENDANCE_API.SCAN_QR_CODE,
      { params },
    ).then(res => res.data),

  /**
   * Remove a QR code (deactivate it)
   * GET /api/attendances/remove-qrcode?scheduleId={scheduleId}&isCheckIn={isCheckIn}
   */
  removeQRCode: (params: RemoveQRCodeRequest) =>
    axiosInstance.get<RemoveQRCodeResponse>(
      ATTENDANCE_API.REMOVE_QR_CODE,
      { params },
    ).then(res => res.data),
};


