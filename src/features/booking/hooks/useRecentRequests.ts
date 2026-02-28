import { useQuery } from '@tanstack/react-query';
import type {
  GetRecentRequestsRequest,
  GetRecentRequestsResponse,
} from '../types';
import { getRecentRequests } from '../services/booking.service';

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Hook để lấy danh sách booking requests gần đây
 */
export const useRecentRequests = (params: GetRecentRequestsRequest = {}) => {
  return useQuery<GetRecentRequestsResponse>({
    queryKey: ['recentRequests', params],
    queryFn: () => getRecentRequests(params),
    staleTime: 30000, // 30 seconds
  });
};
