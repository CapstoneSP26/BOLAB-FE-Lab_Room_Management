import type { DashboardStatsDto, PendingRequestDto, IncidentDto, UserProfileDto } from '../services/dashboardService';

export const mockDashboardStats: DashboardStatsDto = {
  totalBookings: 182,
  pendingBookings: 20,
  approvedBookings: 152,
  rejectedBookings: 10,
  totalIncidents: 15,
  unresolvedIncidents: 5,
  totalRooms: 24,
  availableRooms: 8,
  totalStudents: 2450,
  totalLecturers: 85,
  averageBookingDuration: 2.5,
  mostBookedRoom: 'Lab A101',
  busiestHourOfDay: 14,
  monthlyBookings: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
  monthlyIncidents: [5, 3, 8, 4, 6, 7, 9, 5, 4, 6, 8, 7],
  approvedBookingsToday: 12,
  checkedInBookingsToday: 9,
  noCheckInBookingsToday: 3,
  checkInCompliancePercentage: 75,
};

export const mockPendingRequests: PendingRequestDto[] = [
  {
    bookingId: 'BK001',
    labRoomName: 'Lab A101',
    buildingName: 'Building A',
    requesterName: 'John Doe',
    requesterEmail: 'john@fpt.edu.vn',
    startTime: '2026-03-19T09:00:00Z',
    endTime: '2026-03-19T11:00:00Z',
    expectedStudents: 30,
    purpose: 'Programming Class',
    requestedAt: '2026-03-18T08:00:00Z',
  },
  {
    bookingId: 'BK002',
    labRoomName: 'Lab B202',
    buildingName: 'Building B',
    requesterName: 'Jane Smith',
    requesterEmail: 'jane@fpt.edu.vn',
    startTime: '2026-03-19T13:00:00Z',
    endTime: '2026-03-19T15:00:00Z',
    expectedStudents: 25,
    purpose: 'Database Workshop',
    requestedAt: '2026-03-18T10:30:00Z',
  },
];

export const mockIncidents: IncidentDto[] = [
  {
    incidentId: 'INC001',
    labRoomName: 'Lab A101',
    description: 'Broken projector in room',
    isResolved: false,
    createdAt: '2026-03-17T14:30:00Z',
    createdByName: 'Manager A',
    daysOpenCount: 1,
  },
  {
    incidentId: 'INC002',
    labRoomName: 'Lab C303',
    description: 'Air conditioning not working',
    isResolved: false,
    createdAt: '2026-03-16T09:00:00Z',
    createdByName: 'Manager B',
    daysOpenCount: 2,
  },
  {
    incidentId: 'INC003',
    labRoomName: 'Lab B202',
    description: 'Computer system malfunction',
    isResolved: false,
    createdAt: '2026-03-18T10:00:00Z',
    createdByName: 'Manager C',
    daysOpenCount: 0,
  },
];

export const mockUserProfile: UserProfileDto = {
  id: 'USR001',
  email: 'admin@fpt.edu.vn',
  fullName: 'Admin User',
  userCode: 'AD001',
  campusName: 'FPT University - HCMC',
  roles: ['admin', 'lab_manager'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2026-03-18T10:00:00Z',
  isActive: true,
};

// Delay helper for realistic mock behavior
export const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));
