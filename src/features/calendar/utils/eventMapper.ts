import type { ScheduleDto } from "../../schedules/types/schedule.type";
import type { BookingDto } from "../../booking/types/booking.type";
import type { CalendarEvent } from "../types/calendar.type";
import { convertUTCStringToLocal } from "../../../utils/date.util";

export const mapBookingToEvent = (booking: BookingDto): CalendarEvent => ({
  id: `booking-${booking.id}`,
  title: booking.userFullName || "Yêu cầu đặt phòng",
  start: convertUTCStringToLocal(booking.startTime),
  end: convertUTCStringToLocal(booking.endTime),
  type: 'BOOKING',
  status: booking.status,
  studentCount: booking.studentCount,
  priorityLevel: booking.priorityLevel ?? 1, // Đợi duyệt thường là Normal (1) hoặc Academic (2)
  rawOrigin: { ...booking, type: 2 },
});

export const mapScheduleToEvent = (schedule: ScheduleDto): CalendarEvent => {
  // Xác định priorityLevel ngầm dựa trên SchedulePriority từ BE gửi lên
  let calculatedPriority = 1;
  if (schedule.schedulePriority === 3) calculatedPriority = 3;
  else if (schedule.schedulePriority === 2) calculatedPriority = 2;

  return {
    id: `schedule-${schedule.id}`,
    title: schedule.subjectCode
      ? `${schedule.subjectCode} - ${schedule.lecturerName}`
      : schedule.lecturerName || "Lịch chính thức",
    groupName: schedule.groupName,
    start: convertUTCStringToLocal(schedule.startTime),
    end: convertUTCStringToLocal(schedule.endTime),
    type: schedule.type,
    status: schedule.status,
    slotName: schedule.slotName,
    studentCount: schedule.studentCount,
    priorityLevel: calculatedPriority,
    rawOrigin: { ...schedule },
  };
};