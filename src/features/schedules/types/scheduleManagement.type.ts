import type { ScheduleDto } from "./schedule.type";

/** Trạng thái lịch (theo yêu cầu UI; backend có thể trả Done thay cho Finish) */
export type ScheduleSessionStatus = "NotYet" | "Active" | "Finish";

export interface ScheduleManagementListParams {
  labRoomId?: number;
  subjectId?: string;
  /** Thời gian bắt đầu khoảng lọc (diễn ra từ) — ISO date hoặc datetime */
  fromDate?: string;
  /** Thời gian kết thúc khoảng lọc (đến) */
  toDate?: string;
  status?: ScheduleSessionStatus | "";
  /** Kiểu schedule (type từ API) */
  scheduleType?: string;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  isDescending?: boolean;
}

export interface CreateSchedulePayload {
  labRoomId: number;
  subjectId: string;
  startTime: string;
  endTime: string;
  type: string;
  status: ScheduleSessionStatus;
}

export type UpdateSchedulePayload = Partial<CreateSchedulePayload>;

export interface UpsertSlotTypePayload {
  code: string;
  name: string;
  campusId?: number;
  slotFrames: {
    id?: number;
    startTime: string;
    endTime: string;
    orderIndex: number;
  }[];
}

export function mapApiStatusToUi(status: string): ScheduleSessionStatus | string {
  const s = status?.trim();
  if (s === "Done") return "Finish";
  return s;
}

export function unwrapData<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    if (d !== undefined) return d as T;
  }
  return raw as T;
}

export type { ScheduleDto };
