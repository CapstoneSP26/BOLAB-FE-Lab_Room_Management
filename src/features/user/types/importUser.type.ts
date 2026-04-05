// ===== Backend API Types (DTO, Request, Response) =====

export interface UserImportDto {
  FullName: string;
  Email: string;
  UserCode: string;
  CampusCode: string;
  RoleNames: string;
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

export interface RowResult<T, E> {
  RowNumber: number;
  Data: T;
  ConvertedEntity: E;
  Errors: RowError[];
  IsCritical: boolean;
  HasWarning: boolean;
}

export interface ImportValidationResult<T, E> {
  Rows: RowResult<T, E>[];
  TotalRows: number;
  ErrorCount: number;
  CanCommit: boolean;
}

export interface ImportResult {
  TotalProcessed: number;
  CreatedCount: number;
  UpdatedCount: number;
  Success: boolean;
}

export interface ValidateUserImportRequest {
  Users: UserImportDto[];
}

export interface CommitUserImportRequest {
  Users: UserImportDto[];
}

export interface CommitUserImportResponse {
  TotalProcessed?: number;
  CreatedCount: number;
  UpdatedCount?: number;
  Success: boolean;
}

// ===== UI State Types =====

export type UploadResultType = "idle" | "success" | "error";

export type ValidationIssue = {
  row: number;
  field: string;
  message: string;
};

export type EditableUserRow = {
  id: string;
  FullName: string;
  Email: string;
  UserCode: string;
  CampusCode: string;
  RoleNames: string;
};

export type UserImportField = keyof EditableUserRow;
export type ValidationErrors = Record<string, string>;

export type PageMeta = {
  start: number;
  end: number;
};
