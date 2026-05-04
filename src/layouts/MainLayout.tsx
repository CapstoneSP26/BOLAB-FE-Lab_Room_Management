import type { PropsWithChildren } from 'react';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Outlet } from 'react-router-dom';

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent relative">
      <Header />
      <main className="flex-1 flex flex-col">{children ? children : <Outlet />}</main>
      <Footer />
    </div>
  );
}
