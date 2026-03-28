/**
 * Mock Data for QR Attendance Testing
 * BOLAB-30: Use these while backend APIs are being developed
 */

import type { QRSession, BookingWithQR, StudentAttendance } from '../types/attendance.type';

/**
 * Mock QR Session
 */
export const MOCK_QR_SESSION: QRSession = {
  id: 'qr-session-001',
  bookingId: '4ffb7dc4-3aab-40a0-95fd-70f4192ddc76',
  roomName: 'Lab 501',
  roomCode: 'L501',
  buildingName: 'Alpha Building',
  date: new Date().toISOString(),
  startTime: '08:00',
  endTime: '10:00',
  lecturerName: 'Nguyễn Văn A',
  lecturerId: 'lecturer-001',
  qrToken: 'QR_SESSION_TOKEN_ABC123XYZ_' + Date.now(), // Unique token
  qrExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Active: 5 minutes from now
  createdAt: new Date().toISOString(),
  isActive: true,
  totalStudents: 30,
  presentCount: 18,
  absentCount: 12,
};

/**
 * Mock Student Attendance List
 */
export const MOCK_STUDENT_ATTENDANCE: StudentAttendance[] = [
  {
    id: 'att-001',
    studentId: 'SE160001',
    studentName: 'Trần Văn B',
    studentEmail: 'tranvanb@fpt.edu.vn',
    rollNumber: 'SE160001',
    scanTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    status: 'present',
    ipAddress: '192.168.1.100',
    deviceInfo: 'iPhone 15 Pro',
  },
  {
    id: 'att-002',
    studentId: 'SE160002',
    studentName: 'Lê Thị C',
    studentEmail: 'lethic@fpt.edu.vn',
    rollNumber: 'SE160002',
    scanTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: 'present',
    ipAddress: '192.168.1.101',
    deviceInfo: 'Samsung Galaxy S24',
  },
  {
    id: 'att-003',
    studentId: 'SE160003',
    studentName: 'Phạm Văn D',
    studentEmail: 'phamvand@fpt.edu.vn',
    rollNumber: 'SE160003',
    scanTime: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    status: 'present',
    ipAddress: '192.168.1.102',
    deviceInfo: 'Xiaomi 13',
  },
  {
    id: 'att-004',
    studentId: 'SE160004',
    studentName: 'Hoàng Thị E',
    studentEmail: 'hoangthie@fpt.edu.vn',
    rollNumber: 'SE160004',
    status: 'absent',
  },
  {
    id: 'att-005',
    studentId: 'SE160005',
    studentName: 'Ngô Văn F',
    studentEmail: 'ngovanf@fpt.edu.vn',
    rollNumber: 'SE160005',
    scanTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    status: 'present',
    ipAddress: '192.168.1.103',
    deviceInfo: 'iPhone 14',
  },
];

/**
 * Mock Lecturer Bookings (with QR status)
 */
export const MOCK_LECTURER_BOOKINGS: BookingWithQR[] = [
  // Upcoming - Has QR Session
  {
    bookingId: '4ffb7dc4-3aab-40a0-95fd-70f4192ddc76',
    roomName: 'Lab 501',
    roomCode: 'L501',
    buildingName: 'Alpha Building',
    date: new Date().toISOString(),
    startTime: '08:00',
    endTime: '10:00',
    status: 'Active',
    purpose: 'Lập trình Web - Buổi thực hành 5',
    hasQRSession: true,
    qrSessionId: 'qr-session-001',
    isUpcoming: true,
    isPast: false,
  },
  // Upcoming - No QR yet
  {
    bookingId: 'booking-002',
    roomName: 'Lab 502',
    roomCode: 'L502',
    buildingName: 'Alpha Building',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days later
    startTime: '10:15',
    endTime: '12:00',
    status: 'NotYet',
    purpose: 'Cấu trúc dữ liệu và giải thuật',
    hasQRSession: false,
    isUpcoming: true,
    isPast: false,
  },
  // Upcoming - Pending approval
  {
    bookingId: 'booking-003',
    roomName: 'Lab 601',
    roomCode: 'L601',
    buildingName: 'Beta Building',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '13:30',
    endTime: '15:30',
    status: 'NotYet',
    purpose: 'Database Management Systems',
    hasQRSession: false,
    isUpcoming: true,
    isPast: false,
  },
  // Past booking
  {
    bookingId: 'booking-004',
    roomName: 'Lab 503',
    roomCode: 'L503',
    buildingName: 'Alpha Building',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    startTime: '08:00',
    endTime: '10:00',
    status: 'Done',
    purpose: 'Mobile Programming - Workshop',
    hasQRSession: true,
    qrSessionId: 'qr-session-past-001',
    isUpcoming: false,
    isPast: true,
  },
  // Past booking - No QR
  {
    bookingId: 'booking-005',
    roomName: 'Lab 504',
    roomCode: 'L504',
    buildingName: 'Alpha Building',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    startTime: '13:00',
    endTime: '15:00',
    status: 'Done',
    purpose: 'Software Engineering Project',
    hasQRSession: false,
    isUpcoming: false,
    isPast: true,
  },
  // Cancelled booking
  {
    bookingId: 'booking-006',
    roomName: 'Lab 505',
    roomCode: 'L505',
    buildingName: 'Alpha Building',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '15:45',
    endTime: '17:30',
    status: 'Done',
    purpose: 'Cloud Computing Lecture',
    hasQRSession: false,
    isUpcoming: false,
    isPast: false,
  },
];
