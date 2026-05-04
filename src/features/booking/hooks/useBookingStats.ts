import { useQuery } from '@tanstack/react-query';
import type {
  GetBookingStatsRequest,
  GetBookingStatsResponse,
} from '../types/booking.type';
import { bookingApi } from '../api/bookingApi';

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Hook để lấy thống kê booking requests
 */
export const useBookingStats = (params: GetBookingStatsRequest = {}) => {
  return useQuery<GetBookingStatsResponse>({
    queryKey: ["bookingStats", params],
    queryFn: () => bookingApi.getBookingStats(params),
    staleTime: 30000, // 30 seconds
  });
};
