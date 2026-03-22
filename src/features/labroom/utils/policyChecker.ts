import {
  addDays,
  addHours,
  isAfter,
  isBefore,
  differenceInHours,
  parse,
  isValid
} from 'date-fns';
import type { PolicyType, PolicyValidationResult } from '../types/policy.types';

/**
 * Kiểm tra các quy định của phòng Lab trước khi cho phép tạo Booking
 * @param policies - Danh sách LabRoomPolicyDto từ API
 * @param bookingData - Dữ liệu người dùng chọn (Ngày, Giờ bắt đầu, Giờ kết thúc)
 */
export const checkLabPolicies = (
  policies: Record<PolicyType, string>, // Dữ liệu đã qua hàm select() của React Query thành dạng Map
  bookingData: { date: string; startTime: string; endTime: string }
): PolicyValidationResult => {
  const { date, startTime, endTime } = bookingData;
  const now = new Date();

  // 1. Parse thời gian để tính toán
  // Giả sử startTime/endTime có định dạng "HH:mm"
  const startDateTime = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const endDateTime = parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());

  if (!isValid(startDateTime) || !isValid(endDateTime)) {
    return { isValid: false, message: 'Định dạng thời gian không hợp lệ.' };
  }

  // 2. Duyệt qua các Rule quan trọng
  // Rule: Thời gian đặt trước tối thiểu (MinBookingLeadTime - đơn vị: Giờ)
  if (policies["MinBookingLeadTime"]) {
    const minHours = parseInt(policies["MinBookingLeadTime"]);
    const earliestAllowed = addHours(now, minHours);
    if (isBefore(startDateTime, earliestAllowed)) {
      return {
        isValid: false,
        message: `Theo quy định, bạn cần đặt trước ít nhất ${minHours} giờ.`
      };
    }
  }

  // Rule: Thời gian đặt trước tối đa (MaxBookingAdvance - đơn vị: Ngày)
  if (policies["MaxBookingAdvance"]) {
    const maxDays = parseInt(policies["MaxBookingAdvance"]);
    const latestAllowed = addDays(now, maxDays);
    if (isAfter(startDateTime, latestAllowed)) {
      return {
        isValid: false,
        message: `Phòng này chỉ cho phép đặt trước tối đa trong vòng ${maxDays} ngày.`
      };
    }
  }

  // Rule: Thời lượng tối đa cho 1 lần đặt tự do (MaxOutSlotDuration - đơn vị: Giờ)
  if (policies["MaxOutSlotDuration"]) {
    const maxDuration = parseFloat(policies["MaxOutSlotDuration"]);
    const requestedDuration = differenceInHours(endDateTime, startDateTime);
    if (requestedDuration > maxDuration) {
      return {
        isValid: false,
        message: `Thời lượng đặt tự do tối đa là ${maxDuration} giờ mỗi lần.`
      };
    }
  }

  // Rule: Giờ giới nghiêm (CurfewTime - ví dụ: "22:00")
  if (policies["CurfewTime"]) {
    const curfewStr = policies["CurfewTime"]; // "22:00"
    const curfewDateTime = parse(`${date} ${curfewStr}`, 'yyyy-MM-dd HH:mm', new Date());

    if (isAfter(endDateTime, curfewDateTime)) {
      return {
        isValid: false,
        message: `Giờ giới nghiêm của phòng là ${curfewStr}. Vui lòng kết thúc sớm hơn.`
      };
    }
  }

  // Rule: Cho phép đặt giờ tự do hay không
  // (Nếu IsFreeTimeAllowed = 0 mà người dùng đang dùng mode OutSlot)
  if (policies["IsFreeTimeAllowed"] === 'false' || policies["IsFreeTimeAllowed"] === '0') {
    // Logic này thường dùng để chặn kéo thả (Drag) trên Calendar
    // return { isValid: false, message: 'Phòng này chỉ cho phép đặt theo Slot cố định.' };
  }

  return { isValid: true };
};
