import { useQuery } from '@tanstack/react-query';
import type {
  GetRecentRequestsRequest,
  GetRecentRequestsResponse,
} from '../types/booking.type';
import { bookingApi } from '../api/bookingApi';
/**
 * ===== BUSINESS LOGIC LAYER =====
 * Hook để lấy danh sách booking requests gần đây
 */
export const useRecentRequests = (params: GetRecentRequestsRequest = {}) => {
  return useQuery<GetRecentRequestsResponse>({
    queryKey: ['recentRequests', params],
    queryFn: () => bookingApi.getRecentRequests(params),
    staleTime: 30000, // 30 seconds
  });
};
