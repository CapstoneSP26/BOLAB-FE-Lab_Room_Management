import type { Schedule } from "../../calendar/api/labSchedulerApi";
import { labSchedulerService } from "../../calendar/api/labSchedulerApi";

import type { Booking } from "../../schedules/api/bookingRequestApi";
import { bookingRequestsService } from "../../schedules/api/bookingRequestApi";

import type { Activity } from "../type";

function roomName(roomId: number) {
  return `Room ${roomId}`;
}

function buildingNameFromSchedule(s: Schedule): string {
  return (s as unknown as { BuildingName?: string }).BuildingName ?? "Unknown";
}

function findScheduleForBooking(
  schedules: Schedule[],
  b: Booking,
): Schedule | null {
  return (
    schedules.find(
      (s) =>
        s.LabRoomId === b.LabRoomId &&
        s.StartTime === b.StartTime &&
        s.EndTime === b.EndTime,
    ) ?? null
  );
}

function toActivitiesFromSchedules(schedules: Schedule[]): Activity[] {
  return schedules.map((s) => {
    const type =
      String(s.CreatedAt) === String(s.UpdatedAt)
        ? "SCHEDULE_CREATED"
        : "SCHEDULE_UPDATED";

    return {
      id: `schedule:${s.Id}`,
      type,
      roomId: s.LabRoomId,
      roomName: roomName(s.LabRoomId),
      buildingName: buildingNameFromSchedule(s),
      userName: s.UpdatedBy || s.CreatedBy || "system",
      userRole: s.FromAdmin ? "ADMIN" : "LAB_MANAGER",
      timestamp: s.UpdatedAt || s.CreatedAt,
      description:
        type === "SCHEDULE_CREATED"
          ? "New schedule slot created"
          : "Schedule updated",
      details: {
        startTime: s.StartTime,
        endTime: s.EndTime,
      },
    };
  });
}

function toActivitiesFromBookings(
  bookings: Booking[],
  schedules: Schedule[],
): Activity[] {
  return bookings.map((b) => {
    const st = String(b.BookingStatus ?? "").toUpperCase();

    const type =
      st === "APPROVED"
        ? "BOOKING_APPROVED"
        : st === "REJECTED"
          ? "BOOKING_REJECTED"
          : "BOOKING_CREATED";

    const sch = findScheduleForBooking(schedules, b);
    const buildingName =
      // nếu booking có BuildingName thì ưu tiên
      (b as unknown as { BuildingName?: string }).BuildingName ??
      (sch ? buildingNameFromSchedule(sch) : "Unknown");

    return {
      id: `booking:${b.Id}`,
      type,
      roomId: b.LabRoomId,
      roomName: roomName(b.LabRoomId),
      buildingName,
      userName: b.UpdatedBy || b.CreatedBy || b.BookedByUserId || "user",
      userRole: "USER",
      timestamp: b.UpdatedAt || b.CreatedAt,
      description:
        type === "BOOKING_CREATED"
          ? "New booking request submitted"
          : type === "BOOKING_APPROVED"
            ? "Booking request approved"
            : "Booking request rejected",
      details: {
        startTime: b.StartTime,
        endTime: b.EndTime,
        previousStatus: "PENDING",
        newStatus: st,
        reason: b.Reason || undefined,
      },
    };
  });
}

export const labRoomActivityService = {
  async listActivities(): Promise<Activity[]> {
    const [schedules, pending, history] = await Promise.all([
      labSchedulerService.listSchedules(),
      bookingRequestsService.listPending(),
      bookingRequestsService.listHistory(),
    ]);

    const bookings = [...pending, ...history];

    const scheduleActs = toActivitiesFromSchedules(schedules);
    const bookingActs = toActivitiesFromBookings(bookings, schedules);

    // sort desc by timestamp
    const all = [...scheduleActs, ...bookingActs].sort((a, b) =>
      a.timestamp < b.timestamp ? 1 : -1,
    );

    return all;
  },
};
