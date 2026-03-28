import { useQuery } from '@tanstack/react-query';
import type { GetRoomsRequest, GetLabRoomsQuery } from '../types/room.type';
import { labroomApi } from '../api/labroom.api';

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Rules:
 * - Tên bắt đầu bằng use
 * - Không viết JSX trong hook
 * - Sử dụng React Query để quản lý API state
 */

export const QUERY_KEYS = {
  ROOMS: 'rooms',
  STATS: 'stats',
} as const;

interface UseRoomsOptions {
  params?: GetRoomsRequest;
  enabled?: boolean;
}

/**
 * Hook lấy danh sách phòng/lab
 */
export const useLabRooms = (params?: GetLabRoomsQuery) => {
  return useQuery({
    queryKey: ['labrooms', params],
    queryFn: () => labroomApi.getRooms(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!params?.buildingId
  });
};


interface UseStatsOptions {
  enabled?: boolean;
}

/**
 * Hook lấy thống kê tổng quan
 */
export const useStats = (options: UseStatsOptions = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.STATS],
    queryFn: labroomApi.getStats,
    enabled,
    staleTime: 1 * 60 * 1000, // 1 phút
    gcTime: 5 * 60 * 1000, // 5 phút
    refetchInterval: 30 * 1000, // Refetch mỗi 30s để cập nhật real-time
  });
};

