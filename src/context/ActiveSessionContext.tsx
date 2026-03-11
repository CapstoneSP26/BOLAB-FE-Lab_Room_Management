/**
 * Active Session Context
 * Global state management for active QR attendance sessions
 */

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { QRSession } from '../features/attendance/types';

interface ActiveSessionContextType {
  activeSession: QRSession | null;
  setActiveSession: (session: QRSession | null) => void;
}

const ActiveSessionContext = createContext<ActiveSessionContextType | undefined>(undefined);

export const ActiveSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<QRSession | null>(null);

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
