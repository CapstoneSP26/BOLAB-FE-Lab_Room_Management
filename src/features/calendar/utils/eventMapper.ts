import type { ScheduleDto } from "../../schedules/types/schedule.type";
import type { BookingDto } from "../../booking/types/booking.type";
import type { CalendarEvent } from "../types/calendar.type";

export const mapBookingToEvent = (booking: BookingDto): CalendarEvent => ({
  id: `booking-${booking.id}`,
  title: `[Đợi duyệt] ${booking.userFullName}`,
  start: booking.startTime,
  end: booking.endTime,
  type: 'BOOKING',
  status: booking.status,
  color: '#FF9F43', // Màu cam đặc trưng cho Booking
  rawOrigin: { ...booking }
});

export const mapScheduleToEvent = (schedule: ScheduleDto): CalendarEvent => ({
  id: `schedule-${schedule.id}`,
  title: `${schedule.subjectCode} - ${schedule.lecturerName}`,
  start: schedule.startTime,
  end: schedule.endTime,
  type: 'SCHEDULE',
  status: 'Approved',
  color: '#28C76F', // Màu xanh đặc trưng cho lịch cứng
  rawOrigin: { ...schedule }
});