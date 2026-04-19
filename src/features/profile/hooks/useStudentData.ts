import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../api/studentApi';

/**
 * Hook to fetch student statistics
 * GET /api/profile/statistics
 */
export const useStudentStatistics = () => {
  return useQuery({
    queryKey: ['profile-statistics'],
    queryFn: () => studentApi.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to fetch user profile
 * GET /api/profile/me
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => studentApi.getProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};

/**
 * Hook to update user profile
 * PUT /api/profile/me
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

/**
 * Hook to fetch notifications
 * GET /api/profile/notifications
 */
export const useNotifications = (pageNumber: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['notifications', pageNumber, pageSize],
    queryFn: () => studentApi.getNotifications(pageNumber, pageSize),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

/**
 * Hook to mark notification as read
 * PUT /api/profile/notifications/{notificationId}/read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/**
 * Hook to fetch recent activities
 * GET /api/profile/recent-activities
 */
export const useRecentActivities = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-activities', limit],
    queryFn: () => studentApi.getRecentActivities(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to change password
 * PUT /api/profile/change-password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: studentApi.changePassword,
  });
};

/**
 * Hook to upload avatar
 * POST /api/profile/avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
