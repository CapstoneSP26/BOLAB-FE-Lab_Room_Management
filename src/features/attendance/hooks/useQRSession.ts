/**
 * useQRSession Hook
 * BOLAB-30: React Query hooks for QR session management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createQRSession,
  getQRSession,
  refreshQRToken,
} from '../services/attendance.service';
import type {
  CreateQRSessionRequest,
  RefreshQRTokenRequest,
} from '../types';

/**
 * Query keys for cache management
 */
export const QR_SESSION_KEYS = {
  QR_SESSION: 'qr-session',
  QR_SESSION_BY_ID: (sessionId: string) => ['qr-session', sessionId],
} as const;

/**
 * Create QR session mutation
 */
export const useCreateQRSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateQRSessionRequest) => createQRSession(request),
    onSuccess: () => {
      // Invalidate lecturer bookings to update hasQRSession flag
      queryClient.invalidateQueries({ queryKey: ['lecturer-bookings'] });
    },
  });
};

/**
 * Get QR session by ID
 */
export const useQRSession = (sessionId: string | null, enablePolling = false) => {
  return useQuery({
    queryKey: QR_SESSION_KEYS.QR_SESSION_BY_ID(sessionId || ''),
    queryFn: () => getQRSession(sessionId!),
    enabled: !!sessionId,
    staleTime: enablePolling ? 0 : 30 * 1000, // 30 seconds if not polling
    refetchInterval: enablePolling ? 5 * 1000 : false, // Poll every 5 seconds if enabled
  });
};

/**
 * Refresh QR token mutation
 */
export const useRefreshQRToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RefreshQRTokenRequest) => refreshQRToken(request),
    onSuccess: (_data, variables) => {
      // Update the cached session with new token
      queryClient.invalidateQueries({
        queryKey: QR_SESSION_KEYS.QR_SESSION_BY_ID(variables.sessionId),
      });
    },
  });
};
