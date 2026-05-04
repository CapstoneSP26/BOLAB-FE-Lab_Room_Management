import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { GetSchedulesParams } from '../types/schedule.type';
import { scheduleApi } from '../api/scheduleApi';

export const useSchedulesAttendance = (params: GetSchedulesParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['schedules-attendance', params],
    queryFn: () => scheduleApi.getScheduleAttendance(params),
    placeholderData: keepPreviousData,
    retry: 2,
    enabled,
  });
};

export const useBookingAttendance = useSchedulesAttendance;
