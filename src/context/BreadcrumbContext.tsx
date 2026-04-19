/**
 * Breadcrumb Context
 * Manages breadcrumb data across the app (building name, room name)
 */

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface BreadcrumbContextType {
  buildingName: string;
  roomName: string;
  setBuildingName: (name: string) => void;
  setRoomName: (name: string) => void;
  reset: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [buildingName, setBuildingName] = useState('');
  const [roomName, setRoomName] = useState('');

  const reset = () => {
    setBuildingName('');
    setRoomName('');
  };

  return (
    <BreadcrumbContext.Provider
      value={{
        buildingName,
        roomName,
        setBuildingName,
        setRoomName,
        reset,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within BreadcrumbProvider');
  }
  return context;
};
