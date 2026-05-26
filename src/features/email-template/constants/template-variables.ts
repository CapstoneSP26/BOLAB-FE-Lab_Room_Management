// template-variables.ts
import { EmailType } from "../types/email-template.type";

export interface VariableItem {
  key: string;
  description: string;
}

export const TEMPLATE_VARIABLES: Record<number, VariableItem[]> = {
  [EmailType.BookingApproved]: [
    { key: "LecturerName", description: "Tên giảng viên" },
    { key: "RoomName", description: "Tên phòng thực hành" },
    { key: "Date", description: "Ngày sử dụng phòng" },
    { key: "StartTime", description: "Giờ bắt đầu" },
    { key: "EndTime", description: "Giờ kết thúc" },
    { key: "Purpose", description: "Mục đích sử dụng" },
    { key: "Reason", description: "Ghi chú từ admin" },
    { key: "DetailLink", description: "Đường dẫn xem chi tiết" },
  ],
  [EmailType.BookingRejected]: [
    { key: "LecturerName", description: "Tên giảng viên" },
    { key: "RoomName", description: "Tên phòng thực hành" },
    { key: "Date", description: "Ngày yêu cầu đặt phòng" },
    { key: "StartTime", description: "Giờ bắt đầu" },
    { key: "EndTime", description: "Giờ kết thúc" },
    { key: "Reason", description: "Lý do từ chối phê duyệt" },
    { key: "RebookLink", description: "Đường dẫn đặt lại phòng" },
  ],
  [EmailType.BookingPending]: [
    { key: "LecturerName", description: "Tên giảng viên" },
    { key: "BookingId", description: "Mã số yêu cầu" },
    { key: "RoomName", description: "Tên phòng thực hành" },
    { key: "Date", description: "Ngày đăng ký" },
    { key: "StartTime", description: "Giờ bắt đầu" },
    { key: "EndTime", description: "Giờ kết thúc" },
  ],
  [EmailType.NewClassSchedule]: [
    { key: "StudentName", description: "Tên sinh viên" },
    { key: "SubjectName", description: "Tên môn học" },
    { key: "SubjectCode", description: "Mã môn học" },
    { key: "RoomName", description: "Tên phòng thực hành" },
    { key: "StartTime", description: "Giờ bắt đầu" },
    { key: "EndTime", description: "Giờ kết thúc" },
    { key: "Date", description: "Ngày học" },
    { key: "LecturerName", description: "Tên giảng viên giảng dạy" },
    { key: "AppUrl", description: "Đường dẫn ứng dụng lịch học" },
  ],
  [EmailType.BookingReminder]: [
    { key: "LecturerName", description: "Tên giảng viên gửi yêu cầu đặt phòng" },
    { key: "RoomName", description: "Tên phòng thực hành/Lab được chọn" },
    { key: "Date", description: "Ngày diễn ra lịch đặt phòng" },
    { key: "StartTime", description: "Thời gian bắt đầu sử dụng" },
    { key: "EndTime", description: "Thời gian kết thúc sử dụng" },
    { key: "Purpose", description: "Lý do/Mục đích mượn phòng Lab" },
    { key: "AdminApprovalLink", description: "Đường dẫn đến trang duyệt đơn của Admin" },
  ],
  [EmailType.RejectedByPriority]: [
    { key: "ReceiverName", description: "Tên người nhận (Giảng viên/Sinh viên phụ trách)" },
    { key: "TargetType", description: "Loại đối tượng bị hủy (Lịch chính khóa / Đơn đặt lẻ)" },
    { key: "TargetName", description: "Tên môn học hoặc Tên phòng hiển thị cụ thể" },
    { key: "RoomName", description: "Tên phòng Lab bị trùng lịch" },
    { key: "Date", description: "Ngày diễn ra lịch bị hủy" },
    { key: "TimeSlot", description: "Khung thời gian cụ thể (Từ mấy giờ đến mấy giờ)" },
    { key: "Reason", description: "Mô tả chi tiết nguyên nhân ưu tiên hệ thống" },
    { key: "ActionLink", description: "Link dẫn đến trang cá nhân đặt lại" }
  ]
};