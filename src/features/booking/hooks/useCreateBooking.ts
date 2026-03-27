import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../api/bookingApi";
import type { CreateBookingCommand } from "../types/booking.type";
import { useToast } from "../../../hooks/useToast"; // Giả sử bạn có hook thông báo

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (command: CreateBookingCommand) => bookingApi.createBooking(command),

    onSuccess: (data) => {
      success("Đặt lịch thành công!", `Mã đặt chỗ của bạn là: ${data.id}`);

      // Quan trọng: Invalidate query để Calendar tự động load lại dữ liệu mới // chưa có calendar-events
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },

    onError: (err: any) => {
      const message = err.response?.data?.message || "Không thể tạo lịch đặt. Vui lòng kiểm tra lại thời gian.";
      error("Lỗi đặt lịch", message);
    }
  });
};