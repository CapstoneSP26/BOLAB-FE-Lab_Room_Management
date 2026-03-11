/**
 * Attendance Service Layer
 * BOLAB-30: API calls for QR code attendance
 */

import axiosInstance from '../../../config/axios';
import type {
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
  GetLecturerBookingsResponse,
  ExportAttendanceRequest,
} from '../types';

/**
 * API endpoints
 */
const ATTENDANCE_API = {
  CREATE_QR_SESSION: '/api/attendance/qr-session',
  GET_QR_SESSION: (sessionId: string) => `/api/attendance/qr-session/${sessionId}`,
  REFRESH_QR_TOKEN: '/api/attendance/qr-session/refresh',
  END_QR_SESSION: (sessionId: string) => `/api/attendance/qr-session/${sessionId}/end`,
  GET_ATTENDANCE_LIST: (sessionId: string) => `/api/attendance/session/${sessionId}/students`,
  MARK_ATTENDANCE: '/api/attendance/mark',
  GET_LECTURER_BOOKINGS: '/api/attendance/lecturer-bookings',
  EXPORT_ATTENDANCE: (sessionId: string) => `/api/attendance/session/${sessionId}/export`,
} as const;

/**
 * Create new QR code session for a booking
 */
export const createQRSession = async (
  request: CreateQRSessionRequest
): Promise<CreateQRSessionResponse> => {
  const response = await axiosInstance.post<CreateQRSessionResponse>(
    ATTENDANCE_API.CREATE_QR_SESSION,
    request
  );
  return response.data;
};

/**
 * Get QR session details by session ID
 */
export const getQRSession = async (sessionId: string): Promise<GetQRSessionResponse> => {
  const response = await axiosInstance.get<GetQRSessionResponse>(
    ATTENDANCE_API.GET_QR_SESSION(sessionId)
  );
  return response.data;
};

/**
 * Refresh QR token (generates new token with new expiry)
 */
export const refreshQRToken = async (
  request: RefreshQRTokenRequest
): Promise<RefreshQRTokenResponse> => {
  const response = await axiosInstance.post<RefreshQRTokenResponse>(
    ATTENDANCE_API.REFRESH_QR_TOKEN,
    request
  );
  return response.data;
};

/**
 * End QR session (deactivate session before expiry)
 */
export const endQRSession = async (
  request: EndQRSessionRequest
): Promise<EndQRSessionResponse> => {
  const response = await axiosInstance.post<EndQRSessionResponse>(
    ATTENDANCE_API.END_QR_SESSION(request.sessionId),
    {}
  );
  return response.data;
};

/**
 * Get attendance list for a session
 */
export const getAttendanceList = async (
  request: GetAttendanceListRequest
): Promise<GetAttendanceListResponse> => {
  const response = await axiosInstance.get<GetAttendanceListResponse>(
    ATTENDANCE_API.GET_ATTENDANCE_LIST(request.sessionId)
  );
  return response.data;
};

/**
 * Mark attendance (called when student scans QR)
 */
export const markAttendance = async (
  request: MarkAttendanceRequest
): Promise<MarkAttendanceResponse> => {
  const response = await axiosInstance.post<MarkAttendanceResponse>(
    ATTENDANCE_API.MARK_ATTENDANCE,
    request
  );
  return response.data;
};

/**
 * Get lecturer's bookings (for QR management)
 */
export const getLecturerBookings = async (): Promise<GetLecturerBookingsResponse> => {
  const response = await axiosInstance.get<GetLecturerBookingsResponse>(
    ATTENDANCE_API.GET_LECTURER_BOOKINGS
  );
  return response.data;
};

/**
 * Export attendance to file
 */
export const exportAttendance = async (
  request: ExportAttendanceRequest
): Promise<Blob> => {
  const response = await axiosInstance.get(
    ATTENDANCE_API.EXPORT_ATTENDANCE(request.sessionId),
    {
      params: { format: request.format },
      responseType: 'blob',
    }
  );
  return response.data;
};
