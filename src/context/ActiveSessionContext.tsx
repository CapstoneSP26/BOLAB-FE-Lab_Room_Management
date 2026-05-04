/**
 * Active Session Context
 * Global state management for attendance sessions
 * 
 * Note: This context uses a simplified session type.
 * With the backend API refactor, this context needs to be reimplemented
 * to work with the new attendance data structure.
 */

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Session object for displaying active QR codes/attendance
 * This is a simplified version that works with the current backend API
 */
export interface AttendanceSession {
  id: string;
  scheduleId?: string;
  roomName: string;
  buildingName?: string;
  isActive: boolean;
  qrExpiry?: string;
  presentCount?: number;
  [key: string]: any;
}

interface ActiveSessionContextType {
  activeSession: AttendanceSession | null;
  setActiveSession: (session: AttendanceSession | null) => void;
}

const ActiveSessionContext = createContext<ActiveSessionContextType | undefined>(undefined);

export const ActiveSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);

  return (
    <ActiveSessionContext.Provider value={{ activeSession, setActiveSession }}>
      {children}
    </ActiveSessionContext.Provider>
  );
};

export const useActiveSession = () => {
  const context = useContext(ActiveSessionContext);
  if (!context) {
    throw new Error('useActiveSession must be used within ActiveSessionProvider');
  }
  return context;
};
