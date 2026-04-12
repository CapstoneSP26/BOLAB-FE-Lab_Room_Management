/**
 * useAttendance Hook
 * BOLAB-30: React Query hooks for attendance
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  SubmitAttendanceCommand,
} from '../types/attendance.type';
import { attendanceApi } from '../api/attendanceApi';

/**
 * Query keys
 */
export const ATTENDANCE_KEYS = {
  ATTENDANCE_LIST: (scheduleId: string) => ['attendance-list', scheduleId],
} as const;

/**
 * Get attendance list for a schedule
 */
export const useAttendanceList = (scheduleId: string | null) => {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.ATTENDANCE_LIST(scheduleId || ''),
    queryFn: () => attendanceApi.getAttendanceList({ scheduleId: scheduleId! }),
    enabled: !!scheduleId,
    staleTime: 10 * 1000,
  });
};

/**
 * Submit attendance mutation
 */
export const useSubmitAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: SubmitAttendanceCommand) => attendanceApi.submitAttendance(command),
    onSuccess: (_data, variables) => {
      // Invalidate the attendance list for this schedule
      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_KEYS.ATTENDANCE_LIST(variables.scheduleId),
      });
    },
  });
};
