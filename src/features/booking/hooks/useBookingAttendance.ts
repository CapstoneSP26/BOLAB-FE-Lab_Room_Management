import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { GetBookingsParams } from '../types/booking.type';
import { bookingApi } from '../api/bookingApi';

export const useBookingAttendance = (params: GetBookingsParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['booking-attendance', params],
    queryFn: () => bookingApi.getBookingAttendance(params),
    placeholderData: keepPreviousData,
    retry: 2,
    enabled,
  });
};
