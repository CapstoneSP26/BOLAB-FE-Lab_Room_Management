import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../api/bookingApi";
import { useToast } from "../../../hooks/useToast";
import { QUERY_KEYS } from "./useBookingRequest";

interface RejectParams {
  id: string;
  reason: string;
}

export const useRejectBooking = () => {
  const queryClient = useQueryClient();
  const appAlert = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: RejectParams) => bookingApi.rejectBooking(id, reason),

    onSuccess: () => {
      appAlert.success("Thành công", "Đã từ chối yêu cầu đặt phòng.");

      // Làm mới dữ liệu để cập nhật trạng thái trên UI
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKING_REQUESTS] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },

    onError: (error: any) => {
      const message = error.response?.data?.Message || "Không thể từ chối yêu cầu này.";
      appAlert.error("Lỗi", message);
    },
  });
};