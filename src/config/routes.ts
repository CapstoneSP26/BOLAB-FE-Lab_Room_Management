import { lazy, type LazyExoticComponent ,type ComponentType } from 'react';

export interface AppRoute {
  path: string;
  element: LazyExoticComponent<ComponentType<any>>;
  isPrivate: boolean;
  layout: 'auth' | 'main';
}

const LoginPage = lazy(() => import('../pages/LoginPage'));
const HomePage = lazy(() => import('../pages/HomePage'));
const BuildingDetail = lazy(() => import('../pages/BuildingDetail'));
const RoomBookingPage = lazy(() => import('../pages/RoomBookingPage'));
const BookingHistoryPage = lazy(() => import('../pages/BookingHistoryPage'));

export const appRoutes: AppRoute[] = [
  {
    path: '/login',
    element: LoginPage,
    isPrivate: false,
    layout: 'auth',
  },
  {
    path: '/',
    element: HomePage,
    isPrivate: false, 
    layout: 'main',
  },
  {
    path: '/building/:id',
    element: BuildingDetail,
    isPrivate: false,
    layout: 'main',
  },
  {
    path: '/book-room',
    element: RoomBookingPage,
    isPrivate: true,
    layout: 'main',
  },
  {
    path: '/my-bookings',
    element: BookingHistoryPage,
    isPrivate: true,
    layout: 'main',
  },
];
