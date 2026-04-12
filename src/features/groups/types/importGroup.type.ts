// ===== Backend API Types (DTO, Request, Response) =====

export interface GroupImportDto {
  GroupName: string;
  StudentCode: string;
  SubjectCode: string;
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

export interface ValidateGroupImportRequest {
  Groups: GroupImportDto[];
}

export interface CommitGroupImportRequest {
  Groups: GroupImportDto[];
}

export interface CommitGroupImportResponse {
  Success: boolean;
  TotalProcessed?: number;
  CreatedCount: number;
  UpdatedCount?: number;
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

export type EditableGroupRow = {
  id: string;
  GroupName: string;
  StudentCode: string;
  SubjectCode: string;
};

export type GroupField = keyof EditableGroupRow;
export type ValidationErrors = Record<string, string>;

export type PageMeta = {
  start: number;
  end: number;
};
