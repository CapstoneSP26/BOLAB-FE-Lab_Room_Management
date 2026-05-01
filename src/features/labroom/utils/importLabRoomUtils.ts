import * as XLSX from "xlsx";
import type {
  EditableLabRoomRow,
  LabRoomImportField,
  ValidationIssue,
  ValidationErrors,
  LabRoomImportDto,
} from "../types/importLabRoom.type";

// Row creation
export const createEmptyLabRoomRows = (count: number): EditableLabRoomRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `row-${index + 1}`,
    BuildingCode: "",
    RoomName: "",
    RoomNo: "",
    Location: "",
    Capacity: "",
    HasEquipment: "",
    OverrideNumber: "",
    Description: "",
  }));

// Normalization
export const normalizeHeader = (value: string) =>
  value.trim().replace(/\s+/g, "").toLowerCase();

// Header to field mapping
const headerToField: Record<string, LabRoomImportField> = {
  buildingcode: "BuildingCode",
  roomname: "RoomName",
  roomno: "RoomNo",
  location: "Location",
  capacity: "Capacity",
  hasequipment: "HasEquipment",
};

// Parse Excel file to rows
export const parseLabRoomFileToRows = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<EditableLabRoomRow[]> => {
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
        const headerMap: Record<string, LabRoomImportField> = {};

        Object.keys(firstRow).forEach((header) => {
          const normalizedHeader = normalizeHeader(header);
          const field = headerToField[normalizedHeader];
          if (field) {
            headerMap[header] = field;
          }
        });

        // Convert to EditableLabRoomRow
        const rows: EditableLabRoomRow[] = data.map((row, index) => {
          const editableRow: EditableLabRoomRow = {
            id: `row-${index + 1}`,
            BuildingCode: "",
            RoomName: "",
            RoomNo: "",
            Location: "",
            Capacity: "",
            HasEquipment: "",
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

// Validate labroom rows (client-side)
export const validateLabRoomRowsLocal = (
  rows: EditableLabRoomRow[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 1;

    if (!row.BuildingCode?.trim()) {
      issues.push({
        row: rowNum,
        field: "BuildingCode",
        message: "BuildingCode is required",
      });
    }

    if (!row.RoomName?.trim()) {
      issues.push({
        row: rowNum,
        field: "RoomName",
        message: "RoomName is required",
      });
    }

    if (!row.RoomNo?.trim()) {
      issues.push({
        row: rowNum,
        field: "RoomNo",
        message: "RoomNo is required",
      });
    }

    if (!row.Capacity?.trim()) {
      issues.push({
        row: rowNum,
        field: "Capacity",
        message: "Capacity is required",
      });
    }

    // Validate Capacity is a number
    if (row.Capacity?.trim() && isNaN(Number(row.Capacity))) {
      issues.push({
        row: rowNum,
        field: "Capacity",
        message: "Capacity must be a number",
      });
    }
  });

  return issues;
};

// Convert EditableLabRoomRow[] to LabRoomImportDto[]
export const toLabRoomImportRows = (
  rows: EditableLabRoomRow[]
): LabRoomImportDto[] => {
  return rows.map((row) => ({
    BuildingCode: row.BuildingCode.trim(),
    RoomName: row.RoomName.trim(),
    RoomNo: row.RoomNo.trim(),
    Location: row.Location.trim() || null,
    Capacity: parseInt(row.Capacity.trim(), 10) || 0,
    HasEquipment: row.HasEquipment.trim().toLowerCase() === "true" || row.HasEquipment.trim() === "1",
  }));
};

// Get error key for a cell
export const getLabRoomErrorKey = (
  rowId: string,
  field: LabRoomImportField
): string => `${rowId}-${field}`;

// Resolve field from text input
export const resolveLabRoomFieldFromText = (
  value: string
): string => {
  return value.trim();
};

// Build validation errors map
export const buildLabRoomValidationErrors = (
  validationErrors: ValidationErrors,
  rowId: string,
  field: LabRoomImportField,
  message: string
): ValidationErrors => {
  const key = getLabRoomErrorKey(rowId, field);
  return {
    ...validationErrors,
    [key]: message,
  };
};

// Clear validation errors for a specific row
export const clearLabRoomRowValidationErrors = (
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
export const hasLabRoomRowErrors = (
  validationErrors: ValidationErrors,
  rowId: string
): boolean => {
  return Object.keys(validationErrors).some((key) =>
    key.startsWith(`${rowId}-`)
  );
};

// Get row errors
export const getLabRoomRowErrors = (
  validationErrors: ValidationErrors,
  rowId: string
): string[] => {
  return Object.entries(validationErrors)
    .filter(([key]) => key.startsWith(`${rowId}-`))
    .map(([, value]) => value);
};
