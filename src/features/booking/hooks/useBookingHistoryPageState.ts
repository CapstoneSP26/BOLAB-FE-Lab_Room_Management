import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { GetBookingHistoryRequest, GetBookingHistoryResponse } from '../types/booking.type';
import { bookingApi } from '../api/bookingApi';

/**
 * Hook dữ liệu dành cho BookingHistoryPage.
 *
 * Mục tiêu: giữ đúng vai trò của "hook feature" giống các hook khác trong module booking:
 * - chỉ xử lý gọi API/query cache
 * - không chứa local UI state (search, filter, pagination view)
 */
export const useBookingHistoryPageState = (
  params: GetBookingHistoryRequest = {},
  enabled: boolean = true,
) => {
  return useQuery<GetBookingHistoryResponse>({
    queryKey: ['bookingHistoryPage', params],
    queryFn: () => bookingApi.getBookingHistory(params),
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    enabled,
  });
};
