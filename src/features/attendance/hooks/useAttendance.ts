/**
 * useAttendance Hook
 * BOLAB-30: React Query hooks for attendance tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  MarkAttendanceRequest,
  ExportAttendanceRequest,
} from '../types/attendance.type';
import { attendanceApi } from '../api/attendanceApi';

/**
 * Query keys
 */
export const ATTENDANCE_KEYS = {
  ATTENDANCE_LIST: (sessionId: string) => ['attendance-list', sessionId],
  LECTURER_BOOKINGS: 'lecturer-bookings',
} as const;

/**
 * Get attendance list for a session (with polling)
 */
export const useAttendanceList = (sessionId: string | null, enablePolling = false) => {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.ATTENDANCE_LIST(sessionId || ''),
    queryFn: () => attendanceApi.getAttendanceList({ sessionId: sessionId! }),
    enabled: !!sessionId,
    staleTime: enablePolling ? 0 : 10 * 1000,
    refetchInterval: enablePolling ? 3 * 1000 : false, // Poll every 3 seconds for real-time updates
  });
};

/**
 * Mark attendance mutation (for student scan)
 */
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: MarkAttendanceRequest) => attendanceApi.markAttendance(request),
    onSuccess: () => {
      // Invalidate all attendance lists to refresh counts
      queryClient.invalidateQueries({ queryKey: ['attendance-list'] });
    },
  });
};

/**
 * Get lecturer's bookings (for QR management page)
 */
export const useLecturerBookings = () => {
  return useQuery({
    queryKey: [ATTENDANCE_KEYS.LECTURER_BOOKINGS],
    queryFn: () => attendanceApi.getLecturerBookings(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Export attendance mutation
 */
export const useExportAttendance = () => {
  return useMutation({
    mutationFn: async (request: ExportAttendanceRequest) => {
      const blob = await attendanceApi.exportAttendance(request);

      // Create download link
      const url = window.URL.createObjectURL(new Blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_${request.sessionId}.${request.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
  });
};
