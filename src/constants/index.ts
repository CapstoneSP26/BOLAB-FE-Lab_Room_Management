export const API_ROUTES = {
  AUTH_REFRESH: '/auth/refresh-token',
} as const;

export const QUERY_KEYS = {
  BUILDINGS: 'buildings',
  ROOMS: 'rooms',
  BOOKING: 'booking',
  ATTENDANCE: 'attendance',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  LAB_MANAGER: 'lab_manager',
  LECTURER: 'lecturer',
  STUDENT: 'student',
} as const;
