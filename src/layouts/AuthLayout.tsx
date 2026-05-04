import type { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout({ children }: PropsWithChildren) {
  return <div className="min-h-screen bg-transparent">{children ? children : <Outlet />}</div>;
}
