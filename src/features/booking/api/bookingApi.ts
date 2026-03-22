import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { BookingDto, GetBookingsParams } from "../types/booking.type";

export const bookingApi = {
  getBookings: (params: GetBookingsParams) =>
    axiosInstance.get<PagedResponse<BookingDto>>('/bookings', {
      params,
    }),
};