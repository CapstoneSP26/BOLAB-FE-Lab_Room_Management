import { useQuery } from '@tanstack/react-query';
import type {
  GetUpcomingBookingsRequest,
  GetUpcomingBookingsResponse,
} from '../types/booking.type';
import { bookingApi } from '../api/bookingApi';
/**
 * ===== BUSINESS LOGIC LAYER =====
 * Hook để lấy danh sách lịch booking sắp tới
 */
export const useUpcomingBookings = (params: GetUpcomingBookingsRequest = {}) => {
  return useQuery<GetUpcomingBookingsResponse>({
    queryKey: ['upcomingBookings', params],
    queryFn: () => bookingApi.getUpcomingBookings(params),
    staleTime: 30000, // 30 seconds
  });
};
