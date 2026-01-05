import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

export interface AppRoute {
  path: string;
  element: LazyExoticComponent<ComponentType>;
  isPrivate: boolean;
  layout: 'auth' | 'main';
}

const LoginPage = lazy(() => import("../pages/LoginPage"));

export const appRoutes: AppRoute[] = [
  {
    path: '/login',
    element: LoginPage,
    isPrivate: false,
    layout: 'auth',
  },
];
