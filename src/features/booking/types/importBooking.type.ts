// ===== Backend API Types (DTO, Request, Response) =====

export type BookingImportMode = "schedule" | "slot" | "flexible";

interface LegacyScheduleImportBaseDto {
  GroupName: string;
  SubjectCode: string;
  Date: string;
  RoomNo: string;
  Lecturer: string;
}

export interface ScheduleImportDto {
  GroupName: string;
  SubjectCode: string;
  Date: string;
  SlotOrder: number;
  SlotTypeCode: string;
  RoomNo: string;
  Lecturer: string;
}

export interface OldNewSlotImportDto extends LegacyScheduleImportBaseDto {
  Slot: number;
  TypeSlot: string;
}

export interface FlexibleSlotImportDto extends LegacyScheduleImportBaseDto {
  StartTime: string;
  EndTime: string;
}

export const ErrorSeverity = {
  Warning: 1,
  Error: 2,
} as const;

export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

export interface RowError {
  FieldName?: string | null;
  Message: string;
  Severity: ErrorSeverity;
  ConflictWithRows?: number[] | null;
}

export interface RowResult<T> {
  RowNumber: number;
  Data: T;
  Errors: RowError[];
  IsCritical: boolean;
  HasWarning: boolean;
}

export interface ImportValidationResult<T> {
  Rows: RowResult<T>[];
  TotalRows: number;
  ErrorCount: number;
  CanCommit: boolean;
}

export interface ValidateImportQuery {
  Schedules: ScheduleImportDto[];
}

export interface CommitImportCommand {
  Schedules: ScheduleImportDto[];
}

export interface ValidateOldNewSlotImportRequest {
  Rows: OldNewSlotImportDto[];
}

export interface CommitOldNewSlotImportRequest {
  Rows: OldNewSlotImportDto[];
}

export interface ValidateFlexibleSlotImportRequest {
  Rows: FlexibleSlotImportDto[];
}

export interface CommitFlexibleSlotImportRequest {
  Rows: FlexibleSlotImportDto[];
}

export interface CommitScheduleImportResponse {
  Success: boolean;
  ImportedCount: number;
  FailedCount: number;
  Message: string;
}

// ===== UI State Types =====

export type UploadResultType = "idle" | "success" | "error";

export type ValidationIssue = {
  row: number;
  field: string;
  message: string;
};

export type EditableRow = {
  id: string;
  GroupName: string;
  SubjectCode: string;
  Date: string;
  SlotOrder: string;
  SlotTypeCode: string;
  RoomNo: string;
  Lecturer: string;
};

export type FlexibleEditableRow = {
  id: string;
  GroupName: string;
  SubjectCode: string;
  Date: string;
  StartTime: string;
  EndTime: string;
  RoomNo: string;
  Lecturer: string;
};

export type EditableField = keyof EditableRow;
export type FlexibleField = keyof FlexibleEditableRow;
export type ValidationErrors = Record<string, string>;

export type PageMeta = {
  start: number;
  end: number;
};
