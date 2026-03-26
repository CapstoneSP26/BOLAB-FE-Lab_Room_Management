/**
 * Hook: useEndQRSession
 * End (deactivate) an active QR attendance session
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { EndQRSessionRequest, EndQRSessionResponse } from '../types/attendance.type';
import { attendanceApi } from '../api/attendanceApi';

export const QUERY_KEYS = {
  END_QR_SESSION: 'endQRSession',
} as const;

interface UseEndQRSessionOptions {
  onSuccess?: (data: EndQRSessionResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * End QR session mutation
 * Deactivates an active QR attendance session
 */
export const useEndQRSession = (options: UseEndQRSessionOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QUERY_KEYS.END_QR_SESSION],
    mutationFn: (request: EndQRSessionRequest) => attendanceApi.endQRSession(request),
    onSuccess: (data) => {
      // Invalidate QR session query to reflect isActive = false
      queryClient.invalidateQueries({ queryKey: ['qr-session', data.data.sessionId] });
      // Invalidate lecturer bookings
      queryClient.invalidateQueries({ queryKey: ['lecturer-bookings'] });

      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};
