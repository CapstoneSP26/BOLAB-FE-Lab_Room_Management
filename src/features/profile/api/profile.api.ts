import axiosInstance from "../../../api/axios";
import type { Profile, UserDto } from "../types/profile.type";
import { mapUserDtoToProfile } from "../types/profile.mapper";

export const PROFILE_API = {
  ME: "/profile",
} as const;

export interface GetMyProfileResponse {
  data: UserDto;
}

export type UpdateMyProfileRequest = Partial<UserDto>;

export interface UpdateMyProfileResponse {
  data: UserDto;
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
};
