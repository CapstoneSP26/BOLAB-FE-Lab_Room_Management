import { useQuery } from '@tanstack/react-query';
import type {
  GetBookingHistoryRequest,
  GetBookingHistoryResponse,
} from '../types';
import { getBookingHistory } from '../services/booking.service';

export const QUERY_KEYS = {
  BOOKING_HISTORY: 'bookingHistory',
} as const;

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Hook để lấy lịch sử booking của user
 */
export const useBookingHistory = (params: GetBookingHistoryRequest = {}) => {
  return useQuery<GetBookingHistoryResponse>({
    queryKey: [QUERY_KEYS.BOOKING_HISTORY, params],
    queryFn: () => getBookingHistory(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
