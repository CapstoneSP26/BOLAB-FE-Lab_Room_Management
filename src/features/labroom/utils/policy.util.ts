import {
  addDays,
  addHours,
  isAfter,
  isBefore,
  parse,
  isValid,
  endOfDay
} from 'date-fns';
import type { PolicyTypeEnum, PolicyValidationResult } from '../types/policy.type';
import { PolicyType, PolicyTypeEnumValue } from '../types/policy.type';
import { getCurrentSemesterEndDate } from '../../../utils/semester.util';

const POLICY_TYPE_BY_NUMBER: Record<number, PolicyTypeEnum> = Object.fromEntries(
  (Object.entries(PolicyTypeEnumValue) as [PolicyTypeEnum, number][]).map(
    ([name, num]) => [num, name],
  ),
) as Record<number, PolicyTypeEnum>;

/**
 * Chuẩn hoá PolicyKey từ API: số (enum BE), tên chuỗi, hoặc chuỗi số "1".."7".
 */
export const normalizePolicyKeyFromApi = (raw: unknown): PolicyTypeEnum | undefined => {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return POLICY_TYPE_BY_NUMBER[raw];
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;

    const asNum = Number(trimmed);
    if (Number.isFinite(asNum) && trimmed === String(asNum)) {
      return POLICY_TYPE_BY_NUMBER[asNum];
    }

    if (Object.values(PolicyType).includes(trimmed as PolicyTypeEnum)) {
      return trimmed as PolicyTypeEnum;
    }
  }

  return undefined;
};

/**
 * Kiểm tra các quy định của phòng Lab trước khi cho phép tạo Booking
 * @param policies - Danh sách LabRoomPolicyDto từ API
 * @param bookingData - Dữ liệu người dùng chọn (Ngày, Giờ bắt đầu, Giờ kết thúc)
 */
export const checkLabPolicies = (
  policies: Record<PolicyTypeEnum, string>, // Dữ liệu đã qua hàm select() của React Query thành dạng Map
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

  if (isBefore(startDateTime, now)) {
    return { isValid: false, message: 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại.' };
  }

  // 2. Duyệt qua các Rule quan trọng
  // Rule: Thời gian đặt trước tối thiểu (MinBookingLeadTime - đơn vị: Giờ)
  if (policies[PolicyType.MinBookingLeadTime]) {
    const minHours = parseInt(policies[PolicyType.MinBookingLeadTime]);
    const earliestAllowed = addHours(now, minHours);
    if (isBefore(startDateTime, earliestAllowed)) {
      return {
        isValid: false,
        message: `Theo quy định, bạn cần đặt trước ít nhất ${minHours} giờ.`
      };
    }
  }

  // --- THAY ĐỔI ĐIỀU KIỆN TẠI ĐÂY ---
  // Rule: Thời gian đặt trước tối đa (Phụ thuộc vào MaxBookingAdvance HOẶC Ngày cuối học kỳ)
  const maxDays = Number(policies?.[PolicyType.MaxBookingAdvance] ?? 365);
  const maxAdvanceDate = addDays(now, maxDays);
  const semesterEndDate = getCurrentSemesterEndDate(now);

  // Tìm mốc thời gian giới hạn nhỏ hơn (sớm hơn) và lấy mốc cuối ngày (23:59:59)
  const isAdvanceSooner = isBefore(maxAdvanceDate, semesterEndDate);
  const maxAllowedDate = isAdvanceSooner
    ? endOfDay(maxAdvanceDate)
    : endOfDay(semesterEndDate);
  // Nếu thời gian bắt đầu của người dùng vượt quá mốc chặn trên
  if (isAfter(startDateTime, maxAllowedDate)) {
    if (isAdvanceSooner) {
      return {
        isValid: false,
        message: `Phòng này chỉ cho phép đặt trước tối đa trong vòng ${maxDays} ngày.`
      };
    } else {
      return {
        isValid: false,
        message: 'Bạn chỉ được phép đặt các ngày nằm trong học kỳ hiện tại.'
      };
    }
  }


  // Rule: Giờ giới nghiêm (CurfewTime - ví dụ: "22:00")
  if (policies[PolicyType.CurfewTime]) {
    const curfewStr = policies[PolicyType.CurfewTime]; // "22:00"
    const curfewDateTime = parse(`${date} ${curfewStr}`, 'yyyy-MM-dd HH:mm', new Date());

    if (isAfter(endDateTime, curfewDateTime)) {
      return {
        isValid: false,
        message: `Giờ giới nghiêm của phòng là ${curfewStr}. Vui lòng kết thúc sớm hơn.`
      };
    }
  }

  return { isValid: true };
};


export const isPolicyType = (key: unknown): key is PolicyTypeEnum => {
  return Object.values(PolicyType).includes(key as PolicyTypeEnum);
};