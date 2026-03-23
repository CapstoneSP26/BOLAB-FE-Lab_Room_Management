import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { GetSchedulesParams } from '../types/schedule.type';
import { scheduleApi } from '../api/scheduleApi';

export const useSchedules = (params: GetSchedulesParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['schedules', params],
    queryFn: () => scheduleApi.getSchedules(params),
    placeholderData: keepPreviousData,
    retry: 2,
    enabled,
  });
};