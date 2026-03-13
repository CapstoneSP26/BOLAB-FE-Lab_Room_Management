import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { appRoutes } from './app/routes';
import { ToastContainer } from './components/ToastContainer';
import { useToastStore } from './hooks/useToast';
import { QuickActionFAB } from './components/QuickActionFAB';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';
import { AuthLayout, MainLayout } from './layouts';
import ManagerLayout from './components/layouts/labmanager/ManagerLayout';

export default function App() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const getLayout = (layout: 'auth' | 'main' | 'labmanager') => {
    switch (layout) {
      case 'auth':
        return AuthLayout;
      case 'main':
        return MainLayout;
      case 'labmanager':
        return ManagerLayout;
      default:
        return MainLayout;
    }
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {appRoutes.map((route) => {
            const Page = route.element;
            const Layout = getLayout(route.layout);

            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>

      <ToastContainer toasts={toasts} onClose={removeToast} />
      <QuickActionFAB />
    </ErrorBoundary>
  );
}
