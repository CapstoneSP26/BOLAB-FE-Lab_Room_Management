import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { appRoutes } from './config/routes';
import Header from './components/Header';
import Footer from './components/Footer';
import { BuildingProvider } from './context/BuildingContext';
// import AuthLayout from '@/layouts/AuthLayout';
// import MainLayout from '@/layouts/MainLayout';

export default function App() {
  return (
    <BuildingProvider>
      <div className="min-h-screen flex flex-col bg-transparent relative">
        <Header />
        <div className="flex-1 flex flex-col">
          <Suspense fallback={<div>Loading...</div>}>
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
      </div>
    </BuildingProvider>
  );
}
