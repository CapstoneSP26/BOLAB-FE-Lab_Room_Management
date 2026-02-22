import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface BuildingContextType {
  activeBuildingImage: string | null;
  setActiveBuildingImage: (image: string | null) => void;
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export const BuildingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeBuildingImage, setActiveBuildingImage] = useState<string | null>(null);

  return (
    <BuildingContext.Provider value={{ activeBuildingImage, setActiveBuildingImage }}>
      {children}
    </BuildingContext.Provider>
  );
};

export const useBuildingContext = () => {
  const context = useContext(BuildingContext);
  if (context === undefined) {
    throw new Error('useBuildingContext must be used within a BuildingProvider');
  }
  return context;
};
