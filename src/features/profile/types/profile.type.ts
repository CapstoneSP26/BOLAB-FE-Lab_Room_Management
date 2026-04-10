export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  userCode: string;
  userImageUrl: string;
  phone?: string | null;
  department?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  provider?: string | null;
  providerId?: string | null;
  campusId: number;
  campusName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  lastLogin: string;
  isDeleted?: boolean | null;
  isActive?: boolean | null;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  userCode: string;
  userImageUrl: string;
  phone?: string | null;
  department?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  campusId: number;
  campusName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  lastLogin?: string | null;
  isActive?: boolean | null;
}

export interface ProfileStatisticsDto {
  TotalBookings: number;
  TotalManagedClasses: number;
  TotalHoursTaught: number;
  TotalStudentsLed: number;
  TotalQASessions: number;
}

export interface ProfileStatistics {
  totalBookings: number;
  totalManagedClasses: number;
  totalHoursTaught: number;
  totalStudentsLed: number;
  totalQASessions: number;
}

export interface RecentActivityDto {
  Id?: string;
  ActivityType: string;
  Title: string;
  Description: string;
  LabRoomName?: string | null;
  Date: string;
  Status?: string | null;
}

export type ProfileActivityType =
  | "booking"
  | "qr_generated"
  | "report_sent"
  | "booking_approved"
  | "booking_rejected"
  | "qa_session"
  | "other";

export interface ProfileRecentActivity {
  id: string;
  activityType: ProfileActivityType;
  title: string;
  description: string;
  labRoomName?: string | null;
  timestamp: string;
  status?: string | null;
}
