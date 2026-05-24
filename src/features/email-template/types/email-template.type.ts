export interface EmailTemplateVariable {
  key: string;
  description: string;
}

export interface EmailTemplate {
  id: number;
  content: string;
  type: EmailType;
  variablesJson?: string;
}

export const EmailType = {
  BookingApproved: 1,  // Xác nhận đặt phòng thành công
  BookingRejected: 2,  // Yêu cầu bị từ chối
  BookingPending: 4,   // Hệ thống đã tiếp nhận yêu cầu (Chờ duyệt)
  BookingReminder: 5,
  NewClassSchedule: 6, // Lịch học mới tại phòng LAB
} as const;

export type EmailType = (typeof EmailType)[keyof typeof EmailType];