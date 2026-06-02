// src/utils/semester.util.ts

export interface SemesterInfo {
  code: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

export const getSemesterDetails = (code: string): SemesterInfo => {
  const shortYear = code.substring(2);
  const year = parseInt(`20${shortYear}`);
  const term = code.substring(0, 2);

  let startMonth = 0; // Tháng bắt đầu (0-indexed)
  let endMonth = 0;   // Tháng kết thúc

  switch (term) {
    case 'SP': startMonth = 0; endMonth = 3; break; // Jan - Apr
    case 'SU': startMonth = 4; endMonth = 7; break; // May - Aug
    case 'FA': startMonth = 8; endMonth = 11; break; // Sep - Dec
  }

  // Tạo Date object ở múi giờ UTC
  const start = new Date(year, startMonth, 1, 0, 0, 0);

  // Ngày cuối cùng của tháng kết thúc (dùng 0 của tháng kế tiếp để lấy ngày cuối tháng cũ)
  const end = new Date(year, endMonth + 1, 0, 23, 59, 59, 999);

  const labels: Record<string, string> = { SP: "Spring", SU: "Summer", FA: "Fall" };

  return {
    code,
    label: `${labels[term]} ${year}`,
    startDate: start,
    endDate: end,
  };
};

/**
 * Tự động lấy danh sách kỳ dựa trên thời gian thực hiện tại
 */
export const getDynamicSemesters = (): string[] => {
  const now = new Date();
  const month = now.getMonth() + 1; // Dùng UTC Month cho đồng bộ
  const year = now.getFullYear();

  let currentTerm = "";
  if (month <= 4) currentTerm = "SP";
  else if (month <= 8) currentTerm = "SU";
  else currentTerm = "FA";

  const terms = ["SP", "SU", "FA"];
  let termIndex = terms.indexOf(currentTerm);
  let currentYear = year;
  const result: string[] = [];

  for (let i = 0; i < 3; i++) {
    result.push(`${terms[termIndex]}${currentYear.toString().substring(2)}`);
    termIndex++;
    if (termIndex > 2) {
      termIndex = 0;
      currentYear++;
    }
  }
  return result;
};

// --- HÀM BỔ TRỢ: Lấy ngày cuối cùng của kì học dựa vào ngày hiện tại ---
export const getCurrentSemesterEndDate = (date: Date): Date => {
  const year = date.getFullYear();

  // Định nghĩa khoảng thời gian cho các kì (Ví dụ phổ biến, bạn có thể điều chỉnh lại ngày tháng cho đúng thực tế)
  // Kì Spring (SP): Tháng 1 - Tháng 4 (Kết thúc 30/04)
  // Kì Summer (SU): Tháng 5 - Tháng 8 (Kết thúc 31/08)
  // Kì Fall (FA): Tháng 9 - Tháng 12 (Kết thúc 31/12)
  const month = date.getMonth(); // 0 = Tháng 1, 11 = Tháng 12

  if (month >= 0 && month <= 3) {
    return new Date(year, 3, 30); // 30/04
  } else if (month >= 4 && month <= 7) {
    return new Date(year, 7, 31); // 31/08
  } else {
    return new Date(year, 11, 31); // 31/12
  }
};