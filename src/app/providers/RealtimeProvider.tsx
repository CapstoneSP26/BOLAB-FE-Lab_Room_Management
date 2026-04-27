// src/providers/RealtimeProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../../store/useAuthStore';

const RealtimeContext = createContext<signalR.HubConnection | null>(null);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const { isAuthenticated, isLoading } = useAuthStore();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Chỉ kết nối khi đã đăng nhập xong và chưa có kết nối hiện tại
    if (isAuthenticated && !isLoading && !connectionRef.current) {

      const hubUrl = `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/i, '')}/hubs/notifications`;

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          // QUAN TRỌNG: Với HttpOnly Cookie, ta phải bật withCredentials
          // và KHÔNG dùng accessTokenFactory
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      newConnection.start()
        .then(() => {
          connectionRef.current = newConnection;
          setConnection(newConnection);
        })
        .catch(err => console.error("SignalR Connection Error: ", err));
    }

    // Tự động ngắt kết nối khi logout
    if (!isAuthenticated && connectionRef.current) {
      connectionRef.current.stop();
      connectionRef.current = null;
      setConnection(null);
    }

    return () => {
      // Cleanup khi unmount
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [isAuthenticated, isLoading]);

  return (
    <RealtimeContext.Provider value={connection}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);