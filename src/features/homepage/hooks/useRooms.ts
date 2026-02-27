import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getRooms } from '../services/homepage.service';
import type { GetRoomsRequest, Room } from '../types';

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Rules:
 * - Tên bắt đầu bằng use
 * - Không viết JSX trong hook
 * - Sử dụng React Query để quản lý API state
 */

export const QUERY_KEYS = {
  ROOMS: 'rooms',
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
    queryFn: () => getRooms(params),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 phút (rooms thay đổi thường xuyên hơn)
    gcTime: 5 * 60 * 1000, // 5 phút
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
