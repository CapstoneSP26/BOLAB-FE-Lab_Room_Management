import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GetBuildingsQuery, CreateBuildingPayload, UpdateBuildingPayload, BuildingDto } from '../types/building.type';
import { buildingApi } from '../api/buildingApi';
import type { PagedResponse } from '../../../types/pagination.types';

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
    staleTime: 0, // Luôn coi là dữ liệu cũ để refetch khi cần
    gcTime: 10 * 60 * 1000,
  });
};

export const useBuildingByName = (params: string) => {
  return useQuery({
    queryKey: ['buildingByName', params],
    queryFn: () => buildingApi.getBuildingByName(params),
    retry: 2,
    staleTime: 0,
  });
};

/**
 * Hook tạo tòa nhà
 */
export const useCreateBuilding = (options?: {
  onSuccess?: (data: PagedResponse<BuildingDto>, message: string) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBuildingPayload) =>
      buildingApi.createBuilding(payload),
    onSuccess: async (result) => {
      // Xóa sạch cache và ép tải lại từ server
      await queryClient.resetQueries({ queryKey: [BUILDINGS_KEY], exact: false });
      
      options?.onSuccess?.(result.data, result.message);
    },
    onError: (error) => options?.onError?.(error),
  });
};

/**
 * Hook update tòa nhà
 */
export const useUpdateBuilding = (options?: {
  onSuccess?: (data: PagedResponse<BuildingDto>, message: string) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; payload: UpdateBuildingPayload }) =>
      buildingApi.updateBuilding(input.id, input.payload),
    onSuccess: async (result) => {
      // Xóa sạch cache và ép tải lại từ server
      await queryClient.resetQueries({ queryKey: [BUILDINGS_KEY], exact: false });

      options?.onSuccess?.(result.data, result.message);
    },
    onError: (error) => options?.onError?.(error),
  });
};

/**
 * Hook xóa tòa nhà
 */
export const useDeleteBuilding = (options?: {
  onSuccess?: (message: string) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => buildingApi.deleteBuilding(id),
    onSuccess: async (result) => {
      await queryClient.resetQueries({ queryKey: [BUILDINGS_KEY], exact: false });
      options?.onSuccess?.(result.message);
    },
    onError: (error) => options?.onError?.(error),
  });
};