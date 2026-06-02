import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../api/bookingApi";
import { useToast } from "../../../hooks/useToast";
import { QUERY_KEYS } from "./useBookingRequest";

export const useApproveBooking = () => {
  const queryClient = useQueryClient();
  const appAlert = useToast();

  return useMutation({
    mutationFn: (bookingId: string) => bookingApi.approveBooking(bookingId),

    onSuccess: (response) => {
      const resultData = response.data;
      const cancelledSchedulesCount = resultData?.cancelledScheduleIds?.length || 0;
      const rejectedBookingsCount = resultData?.rejectedBookingIds?.length || 0;

      // 2. Tạo nội dung thông báo động dựa trên kết quả đè Priority
      let detailMessage = "Yêu cầu đặt phòng đã được phê duyệt thành công.";

      if (cancelledSchedulesCount > 0 || rejectedBookingsCount > 0) {
        const details: string[] = [];
        if (cancelledSchedulesCount > 0) {
          details.push(`hủy ${cancelledSchedulesCount} lịch cố định`);
        }
        if (rejectedBookingsCount > 0) {
          details.push(`từ chối ${rejectedBookingsCount} đơn đăng ký trùng`);
        }
        detailMessage += ` Hệ thống đã tự động ${details.join(" và ")} có mức ưu tiên thấp hơn.`;
      }

      // 3. Hiển thị thông báo Toast ra màn hình
      appAlert.success("Phê duyệt thành công", detailMessage);

      // 4. Làm mới dữ liệu các Queries liên quan để đồng bộ UI lập tức
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