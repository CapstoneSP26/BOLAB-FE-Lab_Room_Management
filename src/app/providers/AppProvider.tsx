import { type PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './QueryProvider';

import { BuildingProvider } from '../../context/BuildingContext';
import { ActiveSessionProvider } from '../../context/ActiveSessionContext';
import { BreadcrumbProvider } from '../../context/BreadcrumbContext';

export function AppProvider({ children }: PropsWithChildren) {

  return (
    <BrowserRouter>
      <QueryProvider>
        <BuildingProvider>
          <ActiveSessionProvider>
            <BreadcrumbProvider>{children}</BreadcrumbProvider>
          </ActiveSessionProvider>
        </BuildingProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
