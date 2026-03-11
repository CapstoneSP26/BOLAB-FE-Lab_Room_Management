import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { appRoutes } from './config/routes';
import Header from './components/Header';
import Footer from './components/Footer';
import { BuildingProvider } from './context/BuildingContext';
import { ActiveSessionProvider } from './context/ActiveSessionContext';
import { ToastContainer } from './components/ToastContainer';
import { useToastStore } from './hooks/useToast';
import { QuickActionFAB } from './components/QuickActionFAB';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';
// import AuthLayout from '@/layouts/AuthLayout';
// import MainLayout from '@/layouts/MainLayout';

export default function App() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <ErrorBoundary>
      <BuildingProvider>
        <ActiveSessionProvider>
          <div className="min-h-screen flex flex-col bg-transparent relative">
            <Header />
            <div className="flex-1 flex flex-col">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {appRoutes.map((route) => {
                    const Page = route.element;
                    return (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={<Page />}
                      />
                    );
                  })}
                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </div>
            <Footer />
            
            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
            
            {/* Quick Action FAB */}
            <QuickActionFAB />
          </div>
        </ActiveSessionProvider>
      </BuildingProvider>
    </ErrorBoundary>
  );
}
