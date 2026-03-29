import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  eachDayOfInterval
} from 'date-fns';
import { vi } from 'date-fns/locale';

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