/**
 * Hook: useQRCode
 * For generating and removing QR codes
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  GenerateQRCodeRequest,
  RemoveQRCodeRequest,
} from '../types/attendance.type';
import { attendanceApi } from '../api/attendanceApi';

/**
 * Query keys for cache management
 */
export const QR_CODE_KEYS = {
  QR_CODE: 'qr-code',
  QR_CODE_BY_SCHEDULE: (scheduleId: string) => ['qr-code', scheduleId],
} as const;

/**
 * Generate QR code mutation
 */
export const useGenerateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GenerateQRCodeRequest) => attendanceApi.generateQRCode(request),
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: QR_CODE_KEYS.QR_CODE_BY_SCHEDULE(variables.scheduleId),
      });
    },
  });
};

/**
 * Remove QR code mutation
 */
export const useRemoveQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RemoveQRCodeRequest) => attendanceApi.removeQRCode(request),
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: QR_CODE_KEYS.QR_CODE_BY_SCHEDULE(variables.scheduleId),
      });
    },
  });
};
