import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GetBuildingsQuery, CreateBuildingPayload, UpdateBuildingPayload } from '../types/building.type';
import { buildingApi } from '../api/buildingApi';

interface UseBuildingsOptions {
  params?: GetBuildingsQuery;
  enabled?: boolean;
}
const BUILDINGS_KEY = 'buildings';

/**
 * Hook lấy danh sách tòa nhà
 */
export const useBuildings = (options: UseBuildingsOptions = {}) => {
  const { params, enabled = true } = options;

  return useQuery({
    queryKey: ['buildings', params],
    queryFn: () => buildingApi.getBuildings(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút (cacheTime renamed to gcTime in v5)
  });
};

export const useBuildingByName = (params: string) => {
  return useQuery({
    queryKey: ['buildingByName', params],
    queryFn: () => buildingApi.getBuildingByName(params),
    retry: 2,
  });
};

/**
 * Hook tạo tòa nhà
 */
export const useCreateBuilding = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBuildingPayload) => buildingApi.createBuilding(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [BUILDINGS_KEY] });
      options?.onSuccess?.();
    },
    onError: (error) => options?.onError?.(error),
  });
};

/**
 * Hook update tòa nhà
 */
export const useUpdateBuilding = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; payload: UpdateBuildingPayload }) =>
      buildingApi.updateBuilding(input.id, input.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [BUILDINGS_KEY] });
      options?.onSuccess?.();
    },
    onError: (error) => options?.onError?.(error),
  });
};

/**
 * Hook xóa tòa nhà
 */
export const useDeleteBuilding = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => buildingApi.deleteBuilding(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [BUILDINGS_KEY] });
      options?.onSuccess?.();
    },
    onError: (error) => options?.onError?.(error),
  });
};