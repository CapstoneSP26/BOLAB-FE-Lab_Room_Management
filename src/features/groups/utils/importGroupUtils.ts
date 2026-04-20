import * as XLSX from "xlsx";
import type {
  EditableGroupRow,
  GroupField,
  ValidationIssue,
  ValidationErrors,
  GroupImportDto,
} from "../types/importGroup.type";


// Row creation
export const createEmptyGroupRows = (count: number): EditableGroupRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `row-${index + 1}`,
    GroupName: "",
    StudentCode: "",
    SubjectCode: "",
  }));

// Normalization
export const normalizeHeader = (value: string) =>
  value.trim().replace(/\s+/g, "").toLowerCase();

// Header to field mapping
const headerToField: Record<string, GroupField> = {
  groupname: "GroupName",
  studentcode: "StudentCode",
  subjectcode: "SubjectCode",
};

// Parse Excel file to rows
export const parseGroupFileToRows = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<EditableGroupRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress?.(progress);
      }
    };

    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        if (!worksheet) {
          reject(new Error("No worksheet found"));
          return;
        }

        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          worksheet,
          {
            defval: "",
            raw: false,
          }
        );

        if (data.length === 0) {
          resolve([]);
          return;
        }

        // Detect header mapping
        const firstRow = data[0];
        const headerMap: Record<string, GroupField> = {};

        Object.keys(firstRow).forEach((header) => {
          const normalizedHeader = normalizeHeader(header);
          const field = headerToField[normalizedHeader];
          if (field) {
            headerMap[header] = field;
          }
        });

        // Convert to EditableGroupRow
        const rows: EditableGroupRow[] = data.map((row, index) => {
          const editableRow: EditableGroupRow = {
            id: `row-${index + 1}`,
            GroupName: "",
            StudentCode: "",
            SubjectCode: "",
          };

          Object.entries(headerMap).forEach(([header, field]) => {
            const value = row[header];
            if (value !== undefined && value !== null) {
              editableRow[field] = String(value).trim();
            }
          });

          return editableRow;
        });

        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsArrayBuffer(file);
  });
};

// Validate group rows (client-side)
export const validateGroupRowsLocal = (
  rows: EditableGroupRow[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 1;

    if (!row.GroupName?.trim()) {
      issues.push({
        row: rowNum,
        field: "GroupName",
        message: "GroupName is required",
      });
    }

    if (!row.StudentCode?.trim()) {
      issues.push({
        row: rowNum,
        field: "StudentCode",
        message: "StudentCode is required",
      });
    }

    if (!row.SubjectCode?.trim()) {
      issues.push({
        row: rowNum,
        field: "SubjectCode",
        message: "SubjectCode is required",
      });
    }
  });

  return issues;
};

// Convert EditableGroupRow[] to GroupImportDto[]
export const toGroupImportRows = (
  rows: EditableGroupRow[]
): GroupImportDto[] => {
  return rows.map((row) => ({
    GroupName: row.GroupName.trim(),
    StudentCode: row.StudentCode.trim(),
    SubjectCode: row.SubjectCode.trim(),
  }));
};

// Get error key for a cell
export const getGroupErrorKey = (rowId: string, field: GroupField): string =>
  `${rowId}-${field}`;

// Resolve field from text input
export const resolveGroupFieldFromText = (
  value: string
): string => {
  return value.trim();
};

// Build validation errors map
export const buildGroupValidationErrors = (
  validationErrors: ValidationErrors,
  rowId: string,
  field: GroupField,
  message: string
): ValidationErrors => {
  const key = getGroupErrorKey(rowId, field);
  return {
    ...validationErrors,
    [key]: message,
  };
};

// Clear validation errors for a specific row
export const clearGroupRowValidationErrors = (
  validationErrors: ValidationErrors,
  rowId: string
): ValidationErrors => {
  return Object.entries(validationErrors).reduce(
    (acc, [key, value]) => {
      if (!key.startsWith(`${rowId}-`)) {
        acc[key] = value;
      }
      return acc;
    },
    {} as ValidationErrors
  );
};

// Check if row has errors
export const hasGroupRowErrors = (
  validationErrors: ValidationErrors,
  rowId: string
): boolean => {
  return Object.keys(validationErrors).some((key) =>
    key.startsWith(`${rowId}-`)
  );
};

// Get row errors
export const getGroupRowErrors = (
  validationErrors: ValidationErrors,
  rowId: string
): string[] => {
  return Object.entries(validationErrors)
    .filter(([key]) => key.startsWith(`${rowId}-`))
    .map(([, value]) => value);
};
