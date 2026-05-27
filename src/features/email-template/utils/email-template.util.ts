// Helper hiển thị nhãn đẹp mắt cho enum EmailType
export const getEmailTypeName = (type: number): string => {
  const map: Record<number, string> = {
    1: "Xác Nhận Đặt Phòng (Approved)",
    2: "Yêu Cầu Bị Từ Chối (Rejected)",
    4: "Đang Chờ Phê Duyệt (Pending)",
    6: "Lịch Học Mới Tại Phòng Lab",
    5: "Nhắc Nhở Đặt Phòng (Lab Owner)",
  };
  return map[type] || `Mẫu Email số ${type}`;
};