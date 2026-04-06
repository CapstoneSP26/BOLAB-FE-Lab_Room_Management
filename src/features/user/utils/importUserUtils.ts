import * as XLSX from "xlsx";
import type {
  EditableUserRow,
  UserImportField,
  ValidationIssue,
  ValidationErrors,
  UserImportDto,
} from "../types/importUser.type";
import {
  USER_COLUMNS,
  columnLabels,
  allowedRoles,
} from "../constants/importUser";

// Row creation
export const createEmptyRows = (count: number): EditableUserRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `row-${index + 1}`,
    FullName: "",
    Email: "",
    UserCode: "",
    CampusCode: "",
    RoleNames: "",
  }));

// Normalization
export const normalizeHeader = (value: string) =>
  value.trim().replace(/\s+/g, "").toLowerCase();

export const normalizeRoleName = (value: string): string =>
  value.trim();

// Header to field mapping
const headerToField: Record<string, UserImportField> = {
  fullname: "FullName",
  email: "Email",
  usercode: "UserCode",
  campuscode: "CampusCode",
  rolenames: "RoleNames",
};

const fieldAliasMap: Array<{ field: UserImportField; aliases: string[] }> = [
  { field: "FullName", aliases: ["fullname"] },
  { field: "Email", aliases: ["email"] },
  { field: "UserCode", aliases: ["usercode"] },
  { field: "CampusCode", aliases: ["campuscode"] },
  { field: "RoleNames", aliases: ["rolenames"] },
];

export const resolveFieldFromText = (text: string): UserImportField | null => {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, "");
  const exactMatch = fieldAliasMap.find((item) =>
    item.aliases.some(
      (alias) => normalized === alias || normalized.includes(alias)
    )
  );
  return exactMatch?.field ?? null;
};

// File parsing
export const parseFileToRows = async (file: File): Promise<EditableUserRow[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    return [];
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    worksheet,
    {
      defval: "",
    }
  );

  return rawRows.map((row, index) => {
    const mapped: EditableUserRow = {
      id: `row-${index + 1}`,
      FullName: "",
      Email: "",
      UserCode: "",
      CampusCode: "",
      RoleNames: "",
    };

    Object.entries(row).forEach(([key, value]) => {
      const normalized = normalizeHeader(key);
      const field = headerToField[normalized];
      if (!field || field === "id") return;
      mapped[field] = String(value ?? "").trim();
    });

    return mapped;
  });
};

// Validation helpers
export const getErrorKey = (rowId: string, field: UserImportField) =>
  `${rowId}:${field}`;

export const pushRowIssue = (
  nextErrors: ValidationErrors,
  nextIssues: ValidationIssue[],
  rowId: string,
  rowNumber: number,
  field: UserImportField,
  message: string
) => {
  nextErrors[`${rowId}:${field}`] = message;
  nextIssues.push({
    row: rowNumber,
    field: columnLabels[field],
    message,
  });
};

// Row conversion
export const toUserImportRows = (
  inputRows: EditableUserRow[]
): UserImportDto[] =>
  inputRows.map((row) => ({
    FullName: row.FullName.trim(),
    Email: row.Email.trim(),
    UserCode: row.UserCode.trim(),
    CampusCode: row.CampusCode.trim(),
    RoleNames: normalizeRoleName(row.RoleNames),
  }));

// Validation logic
export const validateRows = (
  rows: EditableUserRow[]
): { errors: ValidationErrors; issues: ValidationIssue[] } => {
  const nextErrors: ValidationErrors = {};
  const nextIssues: ValidationIssue[] = [];

  rows.forEach((row, rowIndex) => {
    (USER_COLUMNS as unknown as UserImportField[]).forEach((field) => {
      const value = row[field].trim();
      if (!value) {
        const key = getErrorKey(row.id, field);
        nextErrors[key] = "Required";
        nextIssues.push({
          row: rowIndex + 1,
          field: columnLabels[field],
          message: "Required field is missing.",
        });
      }
    });

    // Email validation
    const emailValue = row.Email.trim();
    if (emailValue && !isValidEmail(emailValue)) {
      const key = getErrorKey(row.id, "Email");
      nextErrors[key] = "Invalid email format";
      nextIssues.push({
        row: rowIndex + 1,
        field: columnLabels.Email,
        message: "Email must be a valid email address.",
      });
    }

    // RoleNames validation
    const normalizedRoleNames = normalizeRoleName(row.RoleNames);
    if (normalizedRoleNames && !allowedRoles.has(normalizedRoleNames)) {
      const key = getErrorKey(row.id, "RoleNames");
      const validRoles = Array.from(allowedRoles).join(", ");
      nextErrors[key] = `Use one of: ${validRoles}`;
      nextIssues.push({
        row: rowIndex + 1,
        field: columnLabels.RoleNames,
        message: `RoleNames must be one of: ${validRoles}.`,
      });
    }
  });

  return { errors: nextErrors, issues: nextIssues };
};

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
