export const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];
export const MAX_FILE_SIZE_MB = 10;

export const SCHEDULE_COLUMNS = [
  "GroupName",
  "SubjectCode",
  "Date",
  "SlotOrder",
  "RoomNo",
  "Lecturer",
  "SlotTypeCode",
] as const;

export const FLEXIBLE_COLUMNS = [
  "GroupName",
  "SubjectCode",
  "Date",
  "StartTime",
  "EndTime",
  "RoomNo",
  "Lecturer",
] as const;

export const columnLabels = {
  id: "ID",
  GroupName: "GroupName",
  SubjectCode: "SubjectCode",
  Date: "Date",
  SlotOrder: "SlotOrder",
  SlotTypeCode: "SlotTypeCode",
  RoomNo: "RoomNo",
  Lecturer: "Lecturer",
} as const;

export const columnWidths = {
  id: "0px",
  GroupName: "150px",
  SubjectCode: "120px",
  Date: "160px",
  SlotOrder: "100px",
  SlotTypeCode: "140px",
  RoomNo: "150px",
  Lecturer: "160px",
} as const;

export const flexibleColumnLabels = {
  id: "ID",
  GroupName: "GroupName",
  SubjectCode: "SubjectCode",
  Date: "Date",
  StartTime: "StartTime",
  EndTime: "EndTime",
  RoomNo: "RoomNo",
  Lecturer: "Lecturer",
} as const;

export const flexibleColumnWidths = {
  id: "0px",
  GroupName: "150px",
  SubjectCode: "120px",
  Date: "160px",
  StartTime: "110px",
  EndTime: "110px",
  RoomNo: "150px",
  Lecturer: "160px",
} as const;

export const allowedSlotTypes = new Set(["OLD_SLOT", "NEW_SLOT", "OUT_SLOT"]);
