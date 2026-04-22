import { useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import type { GetBookingHistoryRequest } from '../types/booking.type';

const toBaseUrl = () => {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';
  return raw.replace(/\/api\/?$/i, '');
};

const buildHubUrl = () => `${toBaseUrl()}/hubs/notifications`;

/**
 * Realtime hook for booking history pages.
 * Listens to backend SignalR events and invalidates cached booking queries.
 */
export const useBookingHistoryRealtime = (enabled: boolean, params: GetBookingHistoryRequest = {}) => {
  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    const start = async () => {
      if (
        connectionRef.current &&
        connectionRef.current.state !== HubConnectionState.Disconnected
      ) {
        return;
      }

      const token = localStorage.getItem('access_token') || '';
      const connection = new HubConnectionBuilder()
        .withUrl(buildHubUrl(), {
          accessTokenFactory: () => token,
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();

      const refreshBookings = () => {
        queryClient.invalidateQueries({ queryKey: ['bookingHistoryPage'] });
        queryClient.invalidateQueries({ queryKey: ['bookingHistory'] });
        void queryClient.refetchQueries({ queryKey: ['bookingHistoryPage'] });
        void queryClient.refetchQueries({ queryKey: ['bookingHistory'] });
      };

      connection.on('booking.changed', refreshBookings);
      connection.on('notification.created', (payload: { type?: string }) => {
        if (!payload?.type) return;

        if (
          payload.type === 'BookingRejected' ||
          payload.type === 'BookingApproved' ||
          payload.type === 'BookingSubmitted' ||
          payload.type === 'BookingCreated'
        ) {
          refreshBookings();
        }
      });

      await connection.start();

      if (disposed) {
        await connection.stop();
        return;
      }

      connectionRef.current = connection;
    };

    void start();

    return () => {
      disposed = true;
      const connection = connectionRef.current;
      connectionRef.current = null;

      if (connection && connection.state !== HubConnectionState.Disconnected) {
        void connection.stop();
      }
    };
  }, [enabled, params, queryClient]);
};
