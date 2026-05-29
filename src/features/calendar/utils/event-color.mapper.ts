export const getEventAppearance = (type: number | string, status: number | string, isBooking: boolean, priorityLevel?: number) => {
  // 1. Nếu là Booking đang chờ duyệt (Hệ màu Amber/Gold cảnh báo)
  if (isBooking) {
    return {
      container: "bg-gradient-to-br from-amber-50 to-orange-50/30 text-amber-900 border-amber-500 shadow-[0_2px_8px_-2px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20",
      badge: "bg-amber-500 text-white shadow-sm font-black",
      label: priorityLevel === 2 ? "Xếp hàng Academic" : "Chờ duyệt"
    };
  }

  // 2. Nếu lịch đã bị Hủy (Màu xám tối giản, gạch ngang mờ)
  if (status === 4) {
    return {
      container: "bg-slate-50 text-slate-400 border-slate-300 opacity-50 line-through shadow-none ring-1 ring-slate-200",
      badge: "bg-slate-200 text-slate-500 font-normal",
      label: "Đã hủy"
    };
  }

  // 3. Phân loại động dựa trên Trọng số PriorityLevel thực tế của Schedule
  switch (priorityLevel) {
    case 3: // CẤP CAO NHẤT: SCHOOL_EVENT (Màu đỏ Rose Độc quyền)
      return {
        container: "bg-gradient-to-br from-rose-50 to-red-50/30 text-rose-900 border-rose-600 shadow-[0_3px_12px_-2px_rgba(225,29,72,0.2)] ring-1 ring-rose-600/30",
        badge: "bg-rose-600 text-white font-black animate-pulse",
        label: "SỰ KIỆN TRƯỜNG"
      };

    case 2: // CẤP TRUNG BÌNH: ACADEMIC (Màu xanh Royal Học thuật)
      return {
        container: "bg-gradient-to-br from-blue-50 to-indigo-50/30 text-blue-950 border-blue-600 shadow-[0_3px_10px_-2px_rgba(37,99,235,0.15)] ring-1 ring-blue-600/20",
        badge: "bg-blue-600 text-white font-bold",
        label: "HỌC THUẬT"
      };

    case 1: // CẤP THẤP NHẤT: NORMAL (Màu xanh Mint tươi trẻ)
    default:
      return {
        container: "bg-gradient-to-br from-emerald-50/80 to-teal-50/20 text-emerald-950 border-emerald-500 shadow-[0_2px_8px_-2px_rgba(5,150,105,0.12)] ring-1 ring-emerald-500/20",
        badge: "bg-emerald-100 text-emerald-800 font-semibold",
        label: "Tự học/Nhóm"
      };
  }
};