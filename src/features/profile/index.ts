/**
 * Profile Feature Exports
 * Central export point for all profile-related APIs, hooks, types, and components
 */

// APIs
export { studentApi } from './api/studentApi';
export type {
  StudentStatistics,
  StudentTodaySchedule,
  ChangePasswordRequest,
  ApiResponse,
  NotificationDto,
  PagedList,
  ProfileStatisticsDto,
  RecentActivityDto,
  MyProfileDto,
} from './api/studentApi';

export { profileService, PROFILE_API } from './api/profile.api';
export type { GetMyProfileResponse, UpdateMyProfileRequest, UpdateMyProfileResponse } from './api/profile.api';

// Hooks
export {
  useStudentStatistics,
  useProfile,
  useUpdateProfile,
  useNotifications,
  useMarkNotificationAsRead,
  useRecentActivities,
  useChangePassword,
  useUploadAvatar,
} from './hooks/useStudentData';

// Types
export type { Profile, UserDto } from './types/profile.type';

