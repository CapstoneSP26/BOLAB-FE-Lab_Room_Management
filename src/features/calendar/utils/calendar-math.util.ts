import { CALENDAR_CONFIG } from "../constants/calendar.constants";

/**
 * Chuyển đổi tọa độ Y (pixel) sang chuỗi thời gian HH:mm
 * @param y Tọa độ pixel tương đối so với đỉnh của Grid
 * @returns Chuỗi thời gian định dạng "HH:mm"
 */
export const positionToTime = (y: number): string => {
  const { START_HOUR, CELL_HEIGHT, TIME_STEP } = CALENDAR_CONFIG;

  // 1. Tính tổng số phút trôi qua từ START_HOUR
  // Công thức: (y / height_mỗi_giờ) * 60 phút
  let totalMinutes = (y / CELL_HEIGHT) * 60;

  // 2. Làm tròn (Snap) theo bước nhảy (ví dụ 15 phút)
  // Giúp người dùng không đặt được những giờ lẻ như 08:07
  totalMinutes = Math.round(totalMinutes / TIME_STEP) * TIME_STEP;

  const hours = Math.floor(totalMinutes / 60) + START_HOUR;
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Ngược lại: Chuyển từ thời gian HH:mm sang tọa độ Y
 */
export const timeToPosition = (timeStr: string): number => {
  const { START_HOUR, CELL_HEIGHT } = CALENDAR_CONFIG;
  const [hours, minutes] = timeStr.split(':').map(Number);

  return (hours - START_HOUR + minutes / 60) * CELL_HEIGHT;
};

/**
 * Tính toán style top và height dựa trên thời gian bắt đầu và kết thúc
 */
export const getPositionStyle = (startTime: string, endTime: string) => {
  const { START_HOUR, CELL_HEIGHT } = CALENDAR_CONFIG;

  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);

  // Tính vị trí Top
  const top = (sH - START_HOUR + sM / 60) * CELL_HEIGHT;

  // Tính chiều cao Height
  const startTotalMinutes = sH * 60 + sM;
  const endTotalMinutes = eH * 60 + eM;
  const height = ((endTotalMinutes - startTotalMinutes) / 60) * CELL_HEIGHT;

  return {
    top: `${top}px`,
    height: `${height}px`
  };
};