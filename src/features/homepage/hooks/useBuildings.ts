import { useQuery } from '@tanstack/react-query';
import { getBuildings } from '../services/homepage.service';
import type { GetBuildingsRequest } from '../types';

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Rules:
 * - Tên bắt đầu bằng use
 * - Không viết JSX trong hook
 * - Sử dụng React Query để quản lý API state
 */

export const QUERY_KEYS = {
  BUILDINGS: 'buildings',
} as const;

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
    queryKey: [QUERY_KEYS.BUILDINGS, params],
    queryFn: () => getBuildings(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút (cacheTime renamed to gcTime in v5)
  });
};
