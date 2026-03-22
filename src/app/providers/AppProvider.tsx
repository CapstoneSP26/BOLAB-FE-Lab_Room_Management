import { type PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './QueryProvider';

import { BuildingProvider } from '../../context/BuildingContext';
import { ActiveSessionProvider } from '../../context/ActiveSessionContext';

export function AppProvider({ children }: PropsWithChildren) {

  return (
    <BrowserRouter>
      <QueryProvider>
        <BuildingProvider>
          <ActiveSessionProvider>{children}</ActiveSessionProvider>
        </BuildingProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
