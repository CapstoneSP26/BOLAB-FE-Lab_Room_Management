import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  eachDayOfInterval
} from 'date-fns';
import { vi } from 'date-fns/locale';
import type { BookingWithQR } from '../features/attendance/types/attendance.type';
import type { ScheduleDto } from '../features/schedules/types/schedule.type';

/**
 * Chuyển đổi số giờ (decimal) thành chuỗi HH:mm
 * Ví dụ: 8.5 -> "08:30"
 */
export const formatDecimalHour = (hour: number): string => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Lấy danh sách 7 ngày trong tuần dựa trên offset (số tuần chênh lệch)
 * @param weekOffset 0: tuần này, 1: tuần sau, -1: tuần trước
 */
export const getWeekDaysByOffset = (weekOffset: number = 0): Date[] => {
  const today = new Date();

  // 1. Tính toán ngày đầu tuần (Thứ 2) dựa trên offset
  // weekStartsOn: 1 nghĩa là tuần bắt đầu từ Thứ 2
  const targetDate = addWeeks(today, weekOffset);
  const startOfTargetWeek = startOfWeek(targetDate, { weekStartsOn: 1 });

  // 2. Tạo mảng 7 ngày liên tiếp từ ngày bắt đầu
  return eachDayOfInterval({
    start: startOfTargetWeek,
    end: addDays(startOfTargetWeek, 6),
  });
};

/**
 * Format ngày để gửi lên API (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Format hiển thị tiêu đề (Ví dụ: "Thứ 2, 19/03")
 */
export const formatDisplayDate = (date: Date): string => {
  return format(date, 'eeee, dd/MM', { locale: vi });
};

const getIsoDateTimeParts = (value: string): { dateLabel: string; timeLabel: string } | null => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  return {
    dateLabel: `${day}/${month}/${year}`,
    timeLabel: `${hour}:${minute}`,
  };
};

/**
 * Parse giá trị thời gian theo 2 định dạng backend đang trả về:
 * 1) ISO datetime đầy đủ (ví dụ: 2026-03-28T07:30:00Z)
 * 2) Giờ rút gọn HH:mm (ví dụ: 07:30), sẽ ghép với bookingDate.
 */
export const parseTimeValue = (bookingDate: string, value: string): Date => {
  if (value.includes('T')) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const [hourText, minuteText] = value.split(':');
  const base = new Date(bookingDate);
  if (Number.isNaN(base.getTime())) {
    return new Date(0);
  }

  base.setHours(Number(hourText || 0), Number(minuteText || 0), 0, 0);
  return base;
};

/**
 * Kiểm tra thời điểm hiện tại có nằm trong khung giờ học của schedule hay không.
 *
 * Khung giờ được hiểu là: [startTime, endTime] (bao gồm cả điểm đầu và điểm cuối).
 * - now >= startTime
 * - now <= endTime
 */
export const isNowInsideScheduleWindow = (schedule: ScheduleDto): boolean => {
  if (!schedule.startTime || !schedule.endTime) {
    return false;
  }

  const now = new Date();
  const start = parseTimeValue(schedule.startTime, schedule.startTime);
  const end = parseTimeValue(schedule.startTime, schedule.endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false;
  }

  return now >= start && now <= end;
};

/**
 * Kiểm tra thời điểm hiện tại có nằm trong khung giờ của booking hay không.
 *
 * Khung giờ booking cũng dùng interval đóng: [startTime, endTime].
 */
export const isNowInsideFeatureBookingWindow = (booking: BookingWithQR): boolean => {
  const now = new Date();
  const start = parseTimeValue(booking.date, booking.startTime);
  const end = parseTimeValue(booking.date, booking.endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false;
  }

  return now >= start && now <= end;
};

/**
 * Booking được xem là "past" khi đã qua thời điểm endTime.
 * Nếu dữ liệu thời gian lỗi, fallback về cờ isPast từ backend.
 */
export const isBookingPast = (booking: BookingWithQR): boolean => {
  const now = new Date();
  const end = parseTimeValue(booking.date, booking.endTime);
  if (Number.isNaN(end.getTime())) {
    return booking.isPast;
  }
  return end < now;
};

export const isBookingUpcoming = (booking: BookingWithQR): boolean => !isBookingPast(booking);

/**
 * Format nhãn ngày theo dd/MM/yyyy, ưu tiên parse nhanh từ chuỗi ISO.
 */
export const formatUtcDateLabel = (value: string): string => {
  const isoParts = getIsoDateTimeParts(value);
  if (isoParts) {
    return isoParts.dateLabel;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getUTCDate()).padStart(2, '0');
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const year = parsed.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format giờ hiển thị HH:mm cho booking.
 * - Nếu input đã là ISO thì lấy trực tiếp HH:mm từ chuỗi.
 * - Nếu input là HH:mm thì parse theo bookingDate rồi chuẩn hóa theo UTC.
 */
export const formatBookingTimeLabel = (bookingDate: string, value: string): string => {
  const isoParts = getIsoDateTimeParts(value);
  if (isoParts) {
    return isoParts.timeLabel;
  }

  const parsed = parseTimeValue(bookingDate, value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const hour = String(parsed.getUTCHours()).padStart(2, '0');
  const minute = String(parsed.getUTCMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
};

/**
 * Quyền chỉnh sửa session chỉ áp dụng khi session cùng ngày hiện tại.
 * Dùng để bật/tắt trạng thái Read-Only trên UI.
 */
export const isSessionEditable = (sessionDate: string): boolean => {
  const date = new Date(sessionDate);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

/**
 * Lấy thời điểm đầu ngày (00:00) theo giờ Việt Nam (UTC+7)
 * và convert sang UTC ISO string để gửi backend
 */
export const getStartOfDayVNInUTC = (date: Date | string) => {
  const d = new Date(date);

  // Tạo thời điểm 00:00 theo LOCAL (VN)
  const startOfDayLocal = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    0, 0, 0, 0
  );

  // Convert sang UTC ISO string
  return startOfDayLocal.toISOString();
};

/**
 * 2026-03-28T11:30:00.000Z -> 2026-03-28T18:30:00 (Giờ VN)
 */
export const convertUTCStringToLocal = (utcString: string) => {
  return format(new Date(utcString), "yyyy-MM-dd'T'HH:mm:ss");
};

/**
 * ISO datetime → giá trị cho input HTML `datetime-local` (yyyy-MM-ddTHH:mm), theo giờ local.
 * Dùng chung cho form schedule / booking.
 */
export const toDatetimeLocalValue = (iso: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Giá trị từ input `datetime-local` → ISO string gửi API.
 */
export const fromDatetimeLocalValue = (value: string): string => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
};

/**
 * Chuỗi thời gian ISO → nhãn hiển thị trong bảng (dd/MM/yyyy HH:mm).
 */
export const formatIsoDateTimeForDisplay = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "dd/MM/yyyy HH:mm", { locale: vi });
};
