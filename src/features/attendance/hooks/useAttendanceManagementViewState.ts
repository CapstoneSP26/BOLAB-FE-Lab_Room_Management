import type { ScheduleDto } from '../../schedules/types/schedule.type';
import { useAttendanceManagementState } from './useAttendanceManagementState';

interface UseAttendanceManagementViewStateOptions {
  bookingScheduleItems: ScheduleDto[];
  bookingScheduleData: unknown;
}

/**
 * Kept for backward compatibility.
 * This hook is intentionally data/query-focused and contains no local UI state.
 */
export const useAttendanceManagementViewState = (options: UseAttendanceManagementViewStateOptions) => {
  return useAttendanceManagementState(options);
};
