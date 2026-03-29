import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../api/profile.api";
import type { Profile } from "../types/profile.type";
import type { UpdateMyProfileRequest } from "../api/profile.api";

export const PROFILE_QUERY_KEYS = {
  ME: "my-profile",
} as const;

export const useMyProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEYS.ME],
    queryFn: () => profileService.getMe(),
    staleTime: 2 * 60 * 1000,
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
