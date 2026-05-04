import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../api/bookingApi";
import { useToast } from "../../../hooks/useToast";
import { QUERY_KEYS } from "./useBookingRequest";

export const useApproveBooking = () => {
  const queryClient = useQueryClient();
  const appAlert = useToast();

  return useMutation({
    mutationFn: (bookingId: string) => bookingApi.approveBooking(bookingId),

    onSuccess: () => {
      // 1. Thông báo thành công
      appAlert.success("Thành công", "Yêu cầu đặt phòng đã được phê duyệt.");

      // 2. Làm mới dữ liệu lịch và danh sách chờ duyệt
      // 'calendar-events' là key bạn dùng ở trang RoomBookingPage
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKING_REQUESTS] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

    },

    onError: (error: any) => {
      const message = error.response?.data?.Message || "Không thể phê duyệt yêu cầu này.";
      appAlert.error("Lỗi phê duyệt", message);
    },
  });
};