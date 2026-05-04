// src/features/calendar/utils/event-color.mapper.ts

export const getEventAppearance = (type: number | string, status: number | string, isBooking: boolean) => {
  // 1. Nếu là Booking đang chờ duyệt (Lecturer view)
  if (isBooking) {
    return {
      container: "bg-amber-50 text-amber-800 border-amber-400 border-dashed shadow-sm shadow-amber-100",
      badge: "bg-amber-200 text-amber-900",
      label: "Đang chờ duyệt"
    };
  }

  // 2. Nếu lịch đã bị Hủy (Cancelled)
  if (status === 4) {
    return {
      container: "bg-gray-100 text-gray-400 border-gray-300 grayscale opacity-60 line-through",
      badge: "bg-gray-200 text-gray-500",
      label: "Đã hủy"
    };
  }

  // 3. Phân loại theo ScheduleType
  switch (Number(type)) {
    case 1: // Academic (Lịch đào tạo)
      return {
        container: "bg-blue-50 text-blue-800 border-blue-500 shadow-blue-100",
        badge: "bg-blue-200 text-blue-900",
        label: "Chính quy"
      };
    case 2: // Personal (Từ Booking đã duyệt)
      return {
        container: "bg-emerald-50 text-emerald-800 border-emerald-500 shadow-emerald-100",
        badge: "bg-emerald-200 text-emerald-900",
        label: "Cá nhân"
      };
    case 3: // Maintenance
      return {
        container: "bg-slate-100 text-slate-600 border-slate-400",
        badge: "bg-slate-300 text-slate-800",
        label: "Bảo trì"
      };
    case 4: // Examination
      return {
        container: "bg-rose-50 text-rose-800 border-rose-600 shadow-rose-100 ring-1 ring-rose-200",
        badge: "bg-rose-600 text-white",
        label: "LỊCH THI"
      };
    case 5: // Event
      return {
        container: "bg-purple-50 text-purple-800 border-purple-500 shadow-purple-100",
        badge: "bg-purple-200 text-purple-900",
        label: "Sự kiện"
      };
    default:
      return {
        container: "bg-indigo-50 text-indigo-800 border-indigo-500",
        badge: "bg-indigo-200 text-indigo-900",
        label: "Khác"
      };
  }
};