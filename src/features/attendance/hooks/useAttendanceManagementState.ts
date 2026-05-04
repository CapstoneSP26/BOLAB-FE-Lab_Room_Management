import { useMemo } from 'react';
import type { BookingWithQR } from '../types/attendance.type';
import type { GetSchedulesParams, ScheduleDto } from '../../schedules/types/schedule.type';
import {
  mapScheduleDtoToAttendanceBooking,
} from '../utils/attendanceManagementHelpers';
import {
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

const toComparableTime = (value?: string) => {
  if (!value) return Number.NaN;
  const parsed = new Date(value);
  return parsed.getTime();
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

  const activeScheduleItems = useMemo(() => {
    if (bookingScheduleItems.length === 0) {
      return [] as ScheduleDto[];
    }

    return bookingScheduleItems.filter(isNowInsideScheduleWindow);
  }, [bookingScheduleItems]);

  // Find active booking by time
  const activeBooking = useMemo(() => {
    if (activeScheduleItems.length === 0) {
      return null;
    }

    const currentSchedule = activeScheduleItems
      .slice()
      .sort((a, b) => toComparableTime(b.startTime) - toComparableTime(a.startTime))[0];

    if (!currentSchedule) {
      return null;
    }

    return mapScheduleDtoToAttendanceBooking(currentSchedule);
  }, [activeScheduleItems]);

  return {
    bookings,
    activeBooking,
  };
};
