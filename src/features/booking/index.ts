// ===== EXPORT PUBLIC API =====
// Chỉ export những gì cần thiết cho bên ngoài feature sử dụng

// Types
export type {
  BookingDto,
  GetBookingsParams,
  Booking,
  BookingRequest,
  BookingStats,
  BookingStatus,
  BookingStatusFilter,
} from './types/booking.type';
export type {
  BookingImportMode,
  ScheduleImportDto,
  OldNewSlotImportDto,
  FlexibleSlotImportDto,
  ErrorSeverity,
  RowError,
  RowResult,
  ImportValidationResult,
  ValidateImportQuery,
  CommitImportCommand,
  ValidateOldNewSlotImportRequest,
  CommitOldNewSlotImportRequest,
  ValidateFlexibleSlotImportRequest,
  CommitFlexibleSlotImportRequest,
  CommitScheduleImportResponse,
  UploadResultType,
  ValidationIssue,
  EditableRow,
  FlexibleEditableRow,
  EditableField,
  FlexibleField,
  ValidationErrors,
  PageMeta,
} from './types/importBooking.type';

// Hooks
export { useBookings } from './hooks/useBooking';
export { useBookingAttendance } from './hooks/useBookingAttendance';
export { useUpcomingBookings } from './hooks/useUpcomingBookings';
export { useBookingStats } from './hooks/useBookingStats';
export { useRecentRequests } from './hooks/useRecentRequests';
export { useBookingHistory } from './hooks/useBookingHistory';
export { useBookingImport } from './hooks/useBookingImport';

// Components
export { UpcomingBookingCard } from './components/UpcomingBookingCard';
export { BookingStatsCard } from './components/BookingStatsCard';
export { RecentRequestCard } from './components/RecentRequestCard';
export { BookingDashboard } from './components/BookingDashboard';
export { BookingCalendar } from './components/BookingCalendar';
export { BookingDetailsModal } from './components/BookingDetailsModal';
export { ImportBookingFeature, FixedImportPanel, FlexibleImportPanel } from './components';
