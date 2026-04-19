import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookingApi';

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingApi.cancelBooking(bookingId),
    onSuccess: () => {
      // Invalidate queries to refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookingHistoryPage'] });
      queryClient.invalidateQueries({ queryKey: ['bookingStats'] });
    },
  });
};
