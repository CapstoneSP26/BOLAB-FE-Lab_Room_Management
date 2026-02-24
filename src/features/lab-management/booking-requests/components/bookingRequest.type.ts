export type ApprovalStatusKnown = "PENDING" | "APPROVED" | "REJECTED";
export type ApprovalStatus = ApprovalStatusKnown | (string & {});

export type BookingRequest = {
  Id: string;
  LabRoomId: number;
  BookedByUserId: string;
  StartTime: string;
  EndTime: string;
  group_size: number;
  PurposeTypeId: number;
  Reason: string;
  BookingStatus: ApprovalStatus; // pending/approved/rejected
  CreatedAt: string;
  UpdatedAt?: string | null;
  CreatedBy: string;
  UpdatedBy: string;
  IsWeeklyRecurring: boolean;
  RecurringUntil?: string | null;
};
