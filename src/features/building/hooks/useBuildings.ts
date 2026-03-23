import { useQuery } from '@tanstack/react-query';
import type { GetBuildingsRequest } from '../types/building.type';
import { buildingApi } from '../api/buildingApi';

interface UseBuildingsOptions {
  params?: GetBuildingsRequest;
  enabled?: boolean;
}

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
