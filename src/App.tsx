import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { appRoutes } from './config/routes';
// import AuthLayout from '@/layouts/AuthLayout';
// import MainLayout from '@/layouts/MainLayout';

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {appRoutes.map((route) => {
          // const Layout =
          //   route.layout === 'auth' ? AuthLayout : MainLayout;

          const Page = route.element;

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                // <Layout>
                <Page />
                // </Layout>
              }
            />
          );
        })}

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
}
