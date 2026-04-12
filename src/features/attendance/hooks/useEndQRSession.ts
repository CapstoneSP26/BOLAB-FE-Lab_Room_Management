/**
 * Hook: useScanQRCode
 * For scanning QR codes - kept for backward compatibility alias
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ScanQRCodeRequest } from '../types/attendance.type';
import { attendanceApi } from '../api/attendanceApi';

/**
 * Scan QR code mutation
 */
export const useScanQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ScanQRCodeRequest) => attendanceApi.scanQRCode(request),
    onSuccess: () => {
      // Invalidate all attendance queries after scan
      queryClient.invalidateQueries({ queryKey: ['attendance-list'] });
    },
  });
};
