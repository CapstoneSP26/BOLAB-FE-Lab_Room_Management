import { lazy, type LazyExoticComponent } from 'react';

export interface AppRoute {
  path: string;
  element: LazyExoticComponent<React.ComponentType>;
  isPrivate: boolean;
  layout: 'auth' | 'main';
}

const LoginPage = lazy(() => import('../pages/LoginPage.tsx'));

export const appRoutes: AppRoute[] = [
  {
    path: '/login',
    element: LoginPage,
    isPrivate: false,
    layout: 'auth',
  },
];
