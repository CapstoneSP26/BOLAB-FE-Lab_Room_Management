import type { PropsWithChildren } from 'react';

import StudentHeader from '../components/common/StudentHeader';
import Footer from '../components/common/Footer';
import { Outlet } from 'react-router-dom';

export default function StudentLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent relative">
      <StudentHeader />
      <main className="flex-1 flex flex-col">{children ? children : <Outlet />}</main>
      <Footer />
    </div>
  );
}
