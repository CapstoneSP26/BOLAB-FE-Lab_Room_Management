export type ScheduleType = "OLD_SLOT" | "NEW_SLOT" | "OUT_SLOT" | (string & {});
export type ScheduleStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | (string & {});

export interface Schedule {
  Id: string;
  LecturerId: string;
  LabRoomId: number;

  ScheduleType: ScheduleType;
  ScheduleStatus: ScheduleStatus;
  BuildingName: string;
  StartTime: string;
  EndTime: string;

  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;

  IsActive: boolean;
  IsDeleted: boolean;
  FromAdmin: boolean;
}

export interface GetScheduleListResponse {
  data: Schedule[];
}

export interface GetScheduleByIdResponse {
  data: Schedule;
}

export interface UpdateScheduleStatusResponse {
  data: Schedule;
}
