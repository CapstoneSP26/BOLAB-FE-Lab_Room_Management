import axiosInstance from "../../../api/axios";
import type {
  NotificationPreferences,
  Profile,
  ProfileRecentActivity,
  ProfileStatistics,
  ProfileStatisticsDto,
  RecentActivityDto,
  UserDto,
} from "../types/profile.type";
import {
  mapProfileStatisticsDto,
  mapRecentActivityDto,
  mapUserDtoToProfile,
} from "../types/profile.mapper";

export const PROFILE_API = {
  ME: "/profile/me",
  STATISTICS: "/profile/statistics",
  RECENT_ACTIVITIES: "/profile/recent-activities",
  AVATAR: "/profile/avatar",
  CHANGE_PASSWORD: "/profile/change-password",
  NOTIFICATION_PREFERENCES: "/profile/notification-preferences",
} as const;

export interface GetMyProfileResponse {
  data: UserDto;
}

export type UpdateMyProfileRequest = Partial<UserDto>;

export interface UpdateMyProfileResponse {
  data: UserDto;
}

export interface GetStatisticsResponse {
  data: ProfileStatisticsDto;
}

export interface GetRecentActivitiesResponse {
  data: RecentActivityDto[];
}

export interface UploadAvatarResponse {
  data: { avatarUrl?: string; userImageUrl?: string } | string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type UpdateNotificationPreferencesRequest = NotificationPreferences;

export interface UpdateNotificationPreferencesResponse {
  data?: NotificationPreferences;
}

export const profileService = {
  async getMe(): Promise<Profile> {
    const response = await axiosInstance.get<GetMyProfileResponse>(
      PROFILE_API.ME,
    );

    return mapUserDtoToProfile(response.data.data);
  },

  async updateMe(payload: UpdateMyProfileRequest): Promise<Profile> {
    const response = await axiosInstance.put<UpdateMyProfileResponse>(
      PROFILE_API.ME,
      payload,
    );

    return mapUserDtoToProfile(response.data.data);
  },

  async getStatistics(): Promise<ProfileStatistics> {
    const response = await axiosInstance.get<GetStatisticsResponse>(
      PROFILE_API.STATISTICS,
    );

    return mapProfileStatisticsDto(response.data.data);
  },

  async getRecentActivities(
    limit: number = 10,
  ): Promise<ProfileRecentActivity[]> {
    const response = await axiosInstance.get<GetRecentActivitiesResponse>(
      `${PROFILE_API.RECENT_ACTIVITIES}?limit=${limit}`,
    );

    return response.data.data.map(mapRecentActivityDto);
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosInstance.post<UploadAvatarResponse>(
      PROFILE_API.AVATAR,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const payload = response.data.data;
    if (typeof payload === "string") return payload;
    return payload.avatarUrl || payload.userImageUrl || "";
  },

  async updateNotificationPreferences(
    payload: UpdateNotificationPreferencesRequest,
  ): Promise<NotificationPreferences> {

    const response = await axiosInstance.put<UpdateNotificationPreferencesResponse>(
      PROFILE_API.NOTIFICATION_PREFERENCES,
      payload,
    );

    return response.data.data ?? payload;
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await axiosInstance.put(PROFILE_API.CHANGE_PASSWORD, payload);
  },
};
