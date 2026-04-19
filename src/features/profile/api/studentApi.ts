import { axiosInstance } from '../../../api';

/**
 * Student-specific API endpoints
 * Matches backend ProfileController endpoints
 */

export interface StudentStatistics {
  todayAttendance: boolean;
  weekAttendanceRate: number;
  totalClassesAttended: number;
  currentStreak: number;
  totalClasses: number;
}

export interface StudentTodaySchedule {
  id: string;
  subject: string;
  room: string;
  time: string;
  startTime: string;
  endTime: string;
  lecturer: string;
  lecturerId: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
}

export interface PagedList<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProfileStatisticsDto {
  todayAttendance: boolean;
  weekAttendanceRate: number;
  totalClassesAttended: number;
  currentStreak: number;
  totalClasses: number;
}

export interface RecentActivityDto {
  id: string;
  type: 'booking' | 'attendance' | 'notification' | string;
  title: string;
  description: string;
  timestamp: string;
}

export interface MyProfileDto {
  id: string;
  email: string;
  fullName: string;
  userCode: string;
  userImageUrl: string;
  campusId: number;
  createdAt: string;
  updatedAt?: string | null;
  lastLogin?: string | null;
  isActive?: boolean | null;
}

/**
 * Student API Service
 * All endpoints use /api/profile/ base path (from backend ProfileController)
 */
export const studentApi = {
  /**
   * Get student profile statistics
   * GET /api/profile/statistics
   * Backend: GetProfileStatisticsQuery
   */
  getStatistics: () =>
    axiosInstance.get<ApiResponse<ProfileStatisticsDto>>('/profile/statistics')
      .then(res => res.data?.data || res.data),

  /**
   * Get my profile information
   * GET /api/profile/me
   * Backend: GetMyProfileQuery
   */
  getProfile: () =>
    axiosInstance.get<ApiResponse<MyProfileDto>>('/profile/me')
      .then(res => res.data?.data || res.data),

  /**
   * Update my profile
   * PUT /api/profile/me
   * Backend: UpdateMyProfileCommand
   */
  updateProfile: (payload: Partial<MyProfileDto>) =>
    axiosInstance.put<ApiResponse<MyProfileDto>>('/profile/me', payload)
      .then(res => res.data?.data || res.data),

  /**
   * Change password
   * PUT /api/profile/change-password
   * Backend: ChangePasswordCommand
   */
  changePassword: (payload: ChangePasswordRequest) =>
    axiosInstance.put<ApiResponse<any>>('/profile/change-password', payload)
      .then(res => res.data),

  /**
   * Upload avatar
   * POST /api/profile/avatar
   * Backend: UpdateAvatarCommand
   */
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosInstance.post<ApiResponse<{ avatarUrl: string }>>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data?.data || res.data);
  },

  /**
   * Get notifications
   * GET /api/profile/notifications
   * Backend: GetMyNotificationsQuery
   */
  getNotifications: (pageNumber: number = 1, pageSize: number = 10) =>
    axiosInstance.get<ApiResponse<PagedList<NotificationDto>>>('/profile/notifications', {
      params: { pageNumber, pageSize },
    }).then(res => res.data?.data || res.data),

  /**
   * Mark notification as read
   * PUT /api/profile/notifications/{notificationId}/read
   * Backend: MarkNotificationAsReadCommand
   */
  markNotificationAsRead: (notificationId: number) =>
    axiosInstance.put<ApiResponse<any>>(`/profile/notifications/${notificationId}/read`)
      .then(res => res.data),

  /**
   * Get recent activities
   * GET /api/profile/recent-activities
   * Backend: GetRecentActivitiesQuery
   */
  getRecentActivities: (limit: number = 10) =>
    axiosInstance.get<ApiResponse<RecentActivityDto[]>>('/profile/recent-activities', {
      params: { limit },
    }).then(res => res.data?.data || res.data),
};

