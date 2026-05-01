// ===== Backend API Types (DTO, Request, Response) =====

export interface LabRoomImportDto {
  BuildingCode: string;
  RoomName: string;
  RoomNo: string;
  Location?: string | null;
  Capacity: number;
  HasEquipment: boolean;
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

export interface ValidateLabRoomImportRequest {
  LabRooms: LabRoomImportDto[];
}

export interface CommitLabRoomImportRequest {
  LabRooms: LabRoomImportDto[];
}

export interface CommitLabRoomImportResponse {
  Success: boolean;
  TotalProcessed?: number;
  CreatedCount: number;
  UpdatedCount?: number;
  FailedCount?: number;
  Message: string;
}

// ===== UI State Types =====

export type UploadResultType = "idle" | "success" | "error";

export type ValidationIssue = {
  row: number;
  field: string;
  message: string;
};

export type EditableLabRoomRow = {
  id: string;
  BuildingCode: string;
  RoomName: string;
  RoomNo: string;
  Location: string;
  Capacity: string;
  HasEquipment: string;
};

export type LabRoomImportField = keyof EditableLabRoomRow;
export type ValidationErrors = Record<string, string>;

export type PageMeta = {
  start: number;
  end: number;
};
