export type ReportType = "USER" | "LAB_ROOM" | "BOOKING" | "INCIDENT";

export type Report = {
  Id: string; // uniqueidentifier
  ScheduleId?: string | null;
  UserId: string;
  ReportType: ReportType;
  Description: string;
  IsResolved: boolean;
  CreatedAt: string; // ISO datetime
  UpdatedAt?: string | null;
  CreatedBy?: string | null;
  UpdatedBy?: string | null;
};

export type ReportImage = {
  Id: number; // int
  ReportId: string;
  ImageLink: string;
  Size: number; // double
  FileType: string; // varchar
};
