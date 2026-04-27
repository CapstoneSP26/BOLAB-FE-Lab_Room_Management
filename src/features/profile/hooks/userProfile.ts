import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../api/profile.api";
import type { Profile } from "../types/profile.type";
import type { ChangePasswordRequest, UpdateMyProfileRequest } from "../api/profile.api";

export const PROFILE_QUERY_KEYS = {
  ME: "my-profile",
  STATS: "profile-stats",
  RECENT_ACTIVITIES: "profile-recent-activities",
} as const;

export const useMyProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEYS.ME],
    queryFn: async () => {
      const data = await profileService.getMe();
      return data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled,
  });
};

export const useProfileStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEYS.STATS],
    queryFn: () => profileService.getStatistics(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled,
  });
};

export const useRecentActivities = (
  limit: number = 10,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEYS.RECENT_ACTIVITIES, limit],
    queryFn: () => profileService.getRecentActivities(limit),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled,
  });
};

export type UpdateMyProfilePayload = UpdateMyProfileRequest;

export interface UseUpdateMyProfileOptions {
  onSuccess?: (data: Profile) => void;
  onError?: (error: Error) => void;
}

export const useUpdateMyProfile = (options: UseUpdateMyProfileOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMyProfilePayload) =>
      profileService.updateMe(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [PROFILE_QUERY_KEYS.ME],
      });

      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export interface UseUploadAvatarOptions {
  onSuccess?: (avatarUrl: string) => void;
  onError?: (error: Error) => void;
}

export const useUploadAvatar = (options: UseUploadAvatarOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: (avatarUrl) => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEYS.ME] });
      options.onSuccess?.(avatarUrl);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export interface UseChangePasswordOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useChangePassword = (
  options: UseChangePasswordOptions = {},
) => {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      profileService.changePassword(payload),
    onSuccess: () => {
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};
