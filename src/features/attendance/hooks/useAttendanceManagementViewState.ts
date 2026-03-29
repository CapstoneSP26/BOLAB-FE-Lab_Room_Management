import type { QRSession } from '../types/attendance.type';
import type { ScheduleDto } from '../../schedules/types/schedule.type';
import { useAttendanceManagementState } from './useAttendanceManagementState';

interface UseAttendanceManagementViewStateOptions {
  bookingScheduleItems: ScheduleDto[];
  bookingScheduleData: unknown;
  isAttendanceMockMode: boolean;
  activeSession: QRSession | null;
  setActiveSession: (session: QRSession | null) => void;
}

/**
 * Kept for backward compatibility.
 * This hook is intentionally data/query-focused and contains no local UI state.
 */
export const useAttendanceManagementViewState = (options: UseAttendanceManagementViewStateOptions) => {
  return useAttendanceManagementState(options);
};
