import { axiosInstance } from '../../../api';
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
} from '../types/attendance.type';

/**
 * API endpoints
 */
const ATTENDANCE_API = {
  CREATE_QR_SESSION: '/attendance/qr-session',
  GET_QR_SESSION: (sessionId: string) => `/attendance/qr-session/${sessionId}`,
  REFRESH_QR_TOKEN: '/attendance/qr-session/refresh',
  END_QR_SESSION: (sessionId: string) => `/attendance/qr-session/${sessionId}/end`,
  GET_ATTENDANCE_LIST: (sessionId: string) => `/attendance/session/${sessionId}/students`,
  MARK_ATTENDANCE: '/attendance/mark',
  GET_LECTURER_BOOKINGS: '/attendance/lecturer-bookings',
  EXPORT_ATTENDANCE: (sessionId: string) => `/attendance/session/${sessionId}/export`,
} as const;

export const attendanceApi = {
  createQRSession: (params: CreateQRSessionRequest) =>
    axiosInstance.post<CreateQRSessionResponse>(ATTENDANCE_API.CREATE_QR_SESSION, params).then(res => res.data),

  getQRSession: (sessionId: string) =>
    axiosInstance.get<GetQRSessionResponse>(ATTENDANCE_API.GET_QR_SESSION(sessionId)).then(res => res.data),

  refreshQRToken: (params: RefreshQRTokenRequest) =>
    axiosInstance.post<RefreshQRTokenResponse>(ATTENDANCE_API.REFRESH_QR_TOKEN, params).then(res => res.data),

  endQRSession: (params: EndQRSessionRequest) =>
    axiosInstance.post<EndQRSessionResponse>(ATTENDANCE_API.END_QR_SESSION(params.sessionId), {}).then(res => res.data),

  getAttendanceList: (params: GetAttendanceListRequest) =>
    axiosInstance.get<GetAttendanceListResponse>(ATTENDANCE_API.GET_ATTENDANCE_LIST(params.sessionId)).then(res => res.data),

  markAttendance: (params: MarkAttendanceRequest) =>
    axiosInstance.post<MarkAttendanceResponse>(ATTENDANCE_API.MARK_ATTENDANCE, params),

  getLecturerBookings: () =>
    axiosInstance.get<GetLecturerBookingsResponse>(ATTENDANCE_API.GET_LECTURER_BOOKINGS).then(res => res.data),

  exportAttendance: (params: ExportAttendanceRequest) =>
    axiosInstance.post<Blob>(ATTENDANCE_API.EXPORT_ATTENDANCE(params.sessionId), params),

};


