export const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];
export const MAX_FILE_SIZE_MB = 10;

export const GROUP_COLUMNS = [
  "GroupName",
  "StudentCode",
  "SubjectCode",
] as const;

export const columnLabels = {
  id: "ID",
  GroupName: "GroupName",
  StudentCode: "StudentCode",
  SubjectCode: "SubjectCode",
} as const;

export const columnWidths = {
  id: "0px",
  GroupName: "200px",
  StudentCode: "150px",
  SubjectCode: "150px",
} as const;
