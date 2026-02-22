import { useQuery } from '@tanstack/react-query';
import type {
  GetBookingStatsRequest,
  GetBookingStatsResponse,
} from '../types';
import { getBookingStats } from '../services/booking.service';

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Hook để lấy thống kê booking requests
 */
export const useBookingStats = (params: GetBookingStatsRequest = {}) => {
  return useQuery<GetBookingStatsResponse>({
    queryKey: ['bookingStats', params],
    queryFn: () => getBookingStats(params),
    staleTime: 30000, // 30 seconds
  });
};
