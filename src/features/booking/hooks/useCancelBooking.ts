import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookingApi';

// Định nghĩa cấu trúc Payload đầu vào rõ ràng cho Mutation
interface CancelBookingPayload {
  bookingId: string;
  cancelReason: string | null; // Lý do hủy có thể là optional tùy vào yêu cầu BE
}

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Nhận duy nhất 1 object đại diện chứa trọn vẹn phôi dữ liệu
    mutationFn: ({ bookingId, cancelReason }: CancelBookingPayload) =>
      bookingApi.cancelBooking(bookingId, cancelReason),

    onSuccess: () => {
      // Làm mới dữ liệu trên lưới và các thẻ thống kê Realtime
      queryClient.invalidateQueries({ queryKey: ['bookingHistoryPage'] });
      queryClient.invalidateQueries({ queryKey: ['bookingStats'] });
    },
  });
};