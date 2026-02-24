export type ScheduleTypeKnown = "OLD_SLOT" | "NEW_SLOT" | "OUT_SLOT";
export type ScheduleType = ScheduleTypeKnown | (string & {});

export type Schedule = {
  Id: string;
  LecturerId: string;
  LabRoomId: number;
  ScheduleType: ScheduleType;
  ScheduleStatus: string;
  StartTime: string;
  EndTime: string;
  FromAdmin: boolean;
  IsActive: boolean;
  IsDeleted: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;
};
