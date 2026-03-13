import type { PropsWithChildren } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent relative">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
