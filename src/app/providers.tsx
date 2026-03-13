import { type PropsWithChildren, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { BuildingProvider } from '../context/BuildingContext';
import { ActiveSessionProvider } from '../context/ActiveSessionContext';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <BuildingProvider>
          <ActiveSessionProvider>{children}</ActiveSessionProvider>
        </BuildingProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
