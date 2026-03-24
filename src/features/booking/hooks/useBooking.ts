import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { GetBookingsParams } from '../types/booking.type';
import { bookingApi } from '../api/bookingApi';

export const useBookings = (params: GetBookingsParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingApi.getBookings(params),
    placeholderData: keepPreviousData,
    retry: 2,
    enabled,
  });
};