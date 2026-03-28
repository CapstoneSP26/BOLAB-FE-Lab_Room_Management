import { useMemo } from "react";
import { useBookings } from "../../booking/hooks/useBooking";
import { useSchedules } from "../../schedules/hooks/useSchedules";
import type { CalendarEvent, UseCalendarEventProps } from "../types/calendar.type";
import { mapBookingToEvent, mapScheduleToEvent } from "../utils/eventMapper";

export const useCalendarEvents = (params: UseCalendarEventProps) => {
  // 1. Gọi song song 2 Query
  const bookingsQuery = useBookings({
    fromDate: params.startDate,
    toDate: params.endDate,
    labRoomId: params.labRoomId,
    status: 1 // Chỉ lấy những cái chưa duyệt của user hiện tại (Pending = 1)
  },
    params.calendarMode !== 'PUBLIC' // Chỉ gọi API Booking nếu không phải PUBLIC
  );

  const schedulesQuery = useSchedules({
    fromDate: params.startDate,
    toDate: params.endDate,
    labRoomId: params.labRoomId,
  });

  // 4. Hợp nhất và Chuyển đổi dữ liệu (Data Transformation)
  const events = useMemo((): CalendarEvent[] => {
    const bookingEvents = bookingsQuery.data?.items?.map(mapBookingToEvent) || [];
    const scheduleEvents = schedulesQuery.data?.items?.map(mapScheduleToEvent) || [];

    return [...bookingEvents, ...scheduleEvents];
  }, [bookingsQuery.data, schedulesQuery.data]);

  return {
    events,
    isLoading: bookingsQuery.isLoading || schedulesQuery.isLoading,
    isError: bookingsQuery.isError || schedulesQuery.isError,
    refetch: () => {
      bookingsQuery.refetch();
      schedulesQuery.refetch();
    }
  };
};