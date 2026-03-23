import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GetRoomsRequest, Room } from '../types/room.type';
import { labApi } from '../api/labApi';
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
export const useRooms = (options: UseRoomsOptions = {}) => {
  const { params, enabled = true } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.ROOMS, params],
    queryFn: () => labApi.getRooms(params),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 phút (rooms thay đổi thường xuyên hơn)
    gcTime: 5 * 60 * 1000, // 5 phút
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
    queryFn: labApi.getStats,
    enabled,
    staleTime: 1 * 60 * 1000, // 1 phút
    gcTime: 5 * 60 * 1000, // 5 phút
    refetchInterval: 30 * 1000, // Refetch mỗi 30s để cập nhật real-time
  });
};


/**
 * Hook lấy danh sách phòng với client-side filtering
 * Kết hợp server-side params và client-side search
 */
interface UseFilteredRoomsOptions extends UseRoomsOptions {
  searchQuery?: string;
}

export const useFilteredRooms = (options: UseFilteredRoomsOptions = {}) => {
  const { searchQuery = '', ...queryOptions } = options;

  const roomsQuery = useRooms(queryOptions);

  const filteredRooms = useMemo(() => {
    if (!roomsQuery.data?.data) return [];

    if (!searchQuery.trim()) {
      return roomsQuery.data.data;
    }

    const query = searchQuery.toLowerCase();
    return roomsQuery.data.data.filter((room: Room) =>
      room.name.toLowerCase().includes(query) ||
      room.building.toLowerCase().includes(query)
    );
  }, [roomsQuery.data?.data, searchQuery]);

  return {
    ...roomsQuery,
    filteredRooms,
  };
};
