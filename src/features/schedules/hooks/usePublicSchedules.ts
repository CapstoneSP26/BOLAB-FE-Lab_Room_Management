import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { GetSchedulesParams } from '../types/schedule.type';
import { scheduleApi } from '../api/scheduleApi';

export const usePublicSchedules = (params: GetSchedulesParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['schedules', params],
    queryFn: () => scheduleApi.getPublicSchedules(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 4,
    retry: 2,
    enabled,
  });
};