import type { PropsWithChildren } from 'react';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

interface MainLayoutProps extends PropsWithChildren {
  showBreadcrumb?: boolean;
}

export default function MainLayout({ children, showBreadcrumb = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent relative">
      <Header showBreadcrumb={showBreadcrumb} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
