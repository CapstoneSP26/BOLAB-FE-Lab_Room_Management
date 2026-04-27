// src/hooks/useSignalRListener.ts
import { useEffect, useRef } from 'react';
import { useRealtime } from '../app/providers/RealtimeProvider';

export const useSignalRListener = (
  eventName: string,
  callback: (...args: any[]) => void
) => {
  const connection = useRealtime();
  const callbackRef = useRef(callback);

  // Luôn cập nhật ref để callback bên trong connection.on luôn là bản mới nhất
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!connection) return;

    // Handler trung gian để tránh phụ thuộc vào callback trong mảng dependencies
    const handler = (...args: any[]) => {
      callbackRef.current(...args);
    };

    connection.on(eventName, handler);

    return () => {
      connection.off(eventName, handler);
    };
  }, [connection, eventName]);
};