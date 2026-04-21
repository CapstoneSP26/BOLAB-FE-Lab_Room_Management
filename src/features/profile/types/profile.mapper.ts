import type {
  Profile,
  ProfileActivityType,
  ProfileRecentActivity,
  ProfileStatistics,
  ProfileStatisticsDto,
  RecentActivityDto,
  UserDto,
} from "../types/profile.type";

export function splitFullName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, " ");
  if (!cleaned) return { firstName: "", lastName: "" };

  const parts = cleaned.split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function mapUserDtoToProfile(dto: UserDto): Profile {
  return {
    ...dto,
    phone: dto.phone ?? null,
    department: dto.department ?? null,
    role: dto.role ?? null,
    avatarUrl: dto.avatarUrl ?? dto.userImageUrl ?? null,
    bio: dto.bio ?? null,
    campusName: dto.campusName ?? null,
    updatedAt: dto.updatedAt ?? null,
    createdBy: dto.createdBy ?? null,
    updatedBy: dto.updatedBy ?? null,
    lastLogin: dto.lastLogin ?? null,
    isDeleted: dto.isDeleted ?? null,
    isActive: dto.isActive ?? null,
    notificationPreferences: dto.notificationPreferences ?? {
      emailNotifications: true,
      pushNotifications: true,
      bookingApproved: true,
      bookingRejected: true,
      bookingReminder: true,
    },
  };
}

export function mapProfileStatisticsDto(
  dto: ProfileStatisticsDto | any,
): ProfileStatistics {
  return {
    totalBookings: dto.totalBookings ?? dto.TotalBookings ?? 0,
    totalManagedClasses: dto.totalManagedClasses ?? dto.TotalManagedClasses ?? 0,
    totalHoursTaught: dto.totalHoursTaught ?? dto.TotalHoursTaught ?? 0,
    totalStudentsLed: dto.totalStudentsLed ?? dto.TotalStudentsLed ?? 0,
    totalQASessions: dto.totalQASessions ?? dto.TotalQASessions ?? 0,
  };
}

const activityTypeMap: Record<string, ProfileActivityType> = {
  booking: "booking",
  booking_approved: "booking_approved",
  booking_rejected: "booking_rejected",
  qr_generated: "qr_generated",
  qr_session: "qr_generated",
  report_sent: "report_sent",
  qa_session: "qa_session",
};

export function mapRecentActivityDto(
  dto: RecentActivityDto | any,
): ProfileRecentActivity {
  const normalizedType = (dto.activityType || dto.ActivityType)?.toLowerCase() ?? "booking";
  const activityType: ProfileActivityType =
    activityTypeMap[normalizedType] ?? "booking";

  const description = dto.description || dto.Description;
  const labRoomName = dto.labRoomName || dto.LabRoomName;
  const descriptionWithRoom = labRoomName
    ? `${description} — ${labRoomName}`
    : description;

  const generatedId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  return {
    id: dto.id ?? dto.Id ?? generatedId,
    activityType,
    title: dto.title || dto.Title,
    description: descriptionWithRoom,
    labRoomName: labRoomName ?? null,
    timestamp: dto.date || dto.Date,
    status: (dto.status || dto.Status) ?? null,
  };
}
