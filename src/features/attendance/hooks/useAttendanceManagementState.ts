import { useMemo } from 'react';
import type { BookingWithQR } from '../types/attendance.type';
import type { GetSchedulesParams, ScheduleDto } from '../../schedules/types/schedule.type';
import {
  mapScheduleDtoToAttendanceBooking,
  normalizeRoomName,
} from '../utils/attendanceManagementHelpers';
import {
  isNowInsideFeatureBookingWindow,
  isNowInsideScheduleWindow,
} from '../../../utils/date.util';

export interface UseAttendanceManagementStateParams {
  bookingScheduleItems: ScheduleDto[];
  bookingScheduleData: unknown;
}

export const DEFAULT_ATTENDANCE_SCHEDULE_PARAMS: GetSchedulesParams = {
  pageNumber: 1,
  pageSize: 100,
  sortBy: 'startTime',
  isDescending: false,
};

/**
 * Manage attendance state based on schedule data
 * Simplified version without mock data
 */
export const useAttendanceManagementState = ({
  bookingScheduleItems,
  bookingScheduleData,
}: UseAttendanceManagementStateParams) => {
  const bookings = useMemo<BookingWithQR[]>(() => {
    if (bookingScheduleItems.length > 0) {
      return bookingScheduleItems.map(mapScheduleDtoToAttendanceBooking);
    }

    if (bookingScheduleData) {
      return [];
    }

    return [];
  }, [bookingScheduleData, bookingScheduleItems]);

  // Find active room names from schedule windows
  const activeRoomNamesFromSchedule = useMemo(() => {
    if (bookingScheduleItems.length === 0) {
      return new Set(
        bookings
          .filter(item => item.status === 'Active' && isNowInsideFeatureBookingWindow(item))
          .map(item => normalizeRoomName(item.roomName)),
      );
    }

    return new Set(
      bookingScheduleItems
        .filter(isNowInsideScheduleWindow)
        .map(item => normalizeRoomName(item.labRoomName || '')),
    );
  }, [bookingScheduleItems, bookings]);

  // Find active booking by time
  const activeBooking = useMemo(() => {
    if (activeRoomNamesFromSchedule.size === 0) {
      return null;
    }

    return bookings.find(
      booking => activeRoomNamesFromSchedule.has(normalizeRoomName(booking.roomName)),
    ) || null;
  }, [bookings, activeRoomNamesFromSchedule]);

  return {
    bookings,
    activeBooking,
  };
};
