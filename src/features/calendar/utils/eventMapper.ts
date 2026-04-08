import type { ScheduleDto } from "../../schedules/types/schedule.type";
import type { BookingDto } from "../../booking/types/booking.type";
import type { CalendarEvent } from "../types/calendar.type";
import { convertUTCStringToLocal } from "../../../utils/date.util";

export const mapBookingToEvent = (booking: BookingDto): CalendarEvent => ({
  id: `booking-${booking.id}`,
  title: `[Đợi duyệt] ${booking.userFullName}`,
  start: convertUTCStringToLocal(booking.startTime),
  end: convertUTCStringToLocal(booking.endTime),
  type: 'BOOKING',
  status: booking.status,
  rawOrigin: { ...booking, type: 2 },
});

export const mapScheduleToEvent = (schedule: ScheduleDto): CalendarEvent => ({
  id: `schedule-${schedule.id}`,
  title: `${schedule.subjectCode} - ${schedule.lecturerName}`,
  start: convertUTCStringToLocal(schedule.startTime),
  end: convertUTCStringToLocal(schedule.endTime),
  type: schedule.type,
  status: schedule.status,
  rawOrigin: { ...schedule },
  slotName: schedule.slotName,
});
