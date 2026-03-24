import { useQuery } from '@tanstack/react-query';
import type {
  GetBookingHistoryRequest,
  GetBookingHistoryResponse,
} from '../types/booking.type';
import { bookingApi } from '../api/bookingApi';

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Hook để lấy lịch sử booking của user
 */
export const useBookingHistory = (params: GetBookingHistoryRequest = {}) => {
  return useQuery<GetBookingHistoryResponse>({
    queryKey: ["bookingHistory", params],
    queryFn: () => bookingApi.getBookingHistory(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
