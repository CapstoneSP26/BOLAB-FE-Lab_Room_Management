import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../api/bookingApi";
import type { CreateBookingCommand } from "../types/booking.type";

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateBookingCommand) => bookingApi.createBooking(command),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] }); // cần params để chỉ làm m mới data của tuần đó, không thiếu thì sẽ bị reload tất cả các tuần khác khi tạo booking cho tuần này
    },

  });
};