export type CalendarMode = 'PERSONAL' | 'LAB_SPECIFIC' | 'PUBLIC';

export interface UseCalendarEventProps {
  calendarMode: CalendarMode;
  labRoomId?: number; // Bắt buộc nếu mode là LAB_SPECIFIC hoặc PUBLIC
  startDate?: string;
  endDate?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: string;
  status: string;
  rawOrigin: any; // Giữ lại data gốc nếu cần hiển thị Modal chi tiết
  color?: string;
}

export interface WeeklyCalendarProps {
  labRoomId?: number;
  calendarMode: CalendarMode;
  selectedRoomId: string;
  onCreateBooking: (data: {
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  weekOffset?: number;
  onWeekChange: (offset: number) => void;
}
