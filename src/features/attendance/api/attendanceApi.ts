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
  CREATE_QR_SESSION: '/attendances/generate-qrcode',
  GET_QR_SESSION: (sessionId: string) => `/attendances/qr-session/${sessionId}`,
  REFRESH_QR_TOKEN: '/attendances/qr-session/refresh',
  END_QR_SESSION: '/attendances/remove-qrcode',
  GET_ATTENDANCE_LIST: (sessionId: string) => `/attendances/session/${sessionId}/students`,
  MARK_ATTENDANCE: '/attendances/mark',
  GET_LECTURER_BOOKINGS: '/attendances/lecturer-bookings',
  EXPORT_ATTENDANCE: (sessionId: string) => `/attendances/session/${sessionId}/export`,
} as const;

export const attendanceApi = {
  createQRSession: (params: CreateQRSessionRequest) =>
    axiosInstance.get<CreateQRSessionResponse>(ATTENDANCE_API.CREATE_QR_SESSION, { params }).then(res => res.data),

  getQRSession: (sessionId: string) =>
    axiosInstance.get<GetQRSessionResponse>(ATTENDANCE_API.GET_QR_SESSION(sessionId)).then(res => res.data),

  refreshQRToken: (params: RefreshQRTokenRequest) =>
    axiosInstance.post<RefreshQRTokenResponse>(ATTENDANCE_API.REFRESH_QR_TOKEN, params).then(res => res.data),

  endQRSession: (params: EndQRSessionRequest) =>
    axiosInstance.get<EndQRSessionResponse>(ATTENDANCE_API.END_QR_SESSION, { params }).then(res => res.data),

  getAttendanceList: (params: GetAttendanceListRequest) =>
    axiosInstance.get<GetAttendanceListResponse>(ATTENDANCE_API.GET_ATTENDANCE_LIST(params.sessionId)).then(res => res.data),

  markAttendance: (params: MarkAttendanceRequest) =>
    axiosInstance.post<MarkAttendanceResponse>(ATTENDANCE_API.MARK_ATTENDANCE, params).then(res => res.data),

  getLecturerBookings: () =>
    axiosInstance.get<GetLecturerBookingsResponse>(ATTENDANCE_API.GET_LECTURER_BOOKINGS).then(res => res.data),

  exportAttendance: (params: ExportAttendanceRequest) =>
    axiosInstance.post<Blob>(ATTENDANCE_API.EXPORT_ATTENDANCE(params.sessionId), params),

};


