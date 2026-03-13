import { useQuery } from '@tanstack/react-query';
import { getStats } from '../services/homepage.service';

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Rules:
 * - Tên bắt đầu bằng use
 * - Không viết JSX trong hook
 * - Sử dụng React Query để quản lý API state
 */

export const QUERY_KEYS = {
  STATS: 'stats',
} as const;

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
    queryFn: getStats,
    enabled,
    staleTime: 1 * 60 * 1000, // 1 phút
    gcTime: 5 * 60 * 1000, // 5 phút
    refetchInterval: 30 * 1000, // Refetch mỗi 30s để cập nhật real-time
  });
};
