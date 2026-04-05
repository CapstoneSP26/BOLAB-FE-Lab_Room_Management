import * as XLSX from "xlsx";
import type {
  EditableRow,
  FlexibleEditableRow,
  EditableField,
  FlexibleField,
  ValidationIssue,
  ValidationErrors,
  ScheduleImportDto,
  FlexibleSlotImportDto,
} from "../types/importBooking.type";
import {
  SCHEDULE_COLUMNS,
  FLEXIBLE_COLUMNS,
  columnLabels,
  flexibleColumnLabels,
  allowedSlotTypes,
} from "../constants/importBooking";

// Row creation
export const createEmptyRows = (count: number): EditableRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `row-${index + 1}`,
    GroupName: "",
    SubjectCode: "",
    Date: "",
    SlotOrder: "",
    SlotTypeCode: "",
    RoomNo: "",
    Lecturer: "",
  }));

export const createEmptyFlexibleRows = (count: number): FlexibleEditableRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `flex-row-${index + 1}`,
    GroupName: "",
    SubjectCode: "",
    Date: "",
    StartTime: "",
    EndTime: "",
    RoomNo: "",
    Lecturer: "",
  }));

// Normalization
export const normalizeHeader = (value: string) =>
  value.trim().replace(/\s+/g, "").toLowerCase();

export const normalizeSlotTypeCode = (value: string): string =>
  value.trim().toUpperCase().replace(/[-\s]+/g, "_");

// Convert Excel time format (decimal 0-1) to HH:MM
export const convertExcelTimeToTimeString = (value: unknown): string => {
  // Check if value is a number or numeric string
  const numValue = typeof value === "number" ? value : Number(value);

  // If not a valid number, return string representation
  if (isNaN(numValue)) {
    return String(value ?? "").trim();
  }

  // If value is between 0 and 1, it's likely Excel time format
  if (numValue >= 0 && numValue < 1) {
    const totalMinutes = Math.round(numValue * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // If value is between 1 and 100, it might be a time in another format
  // Return as is (e.g., might already be formatted)
  return String(value ?? "").trim();
};

// Header to field mapping
const headerToField: Record<string, EditableField> = {
  groupname: "GroupName",
  subjectcode: "SubjectCode",
  date: "Date",
  slotorder: "SlotOrder",
  slot: "SlotOrder",
  slottypecode: "SlotTypeCode",
  slottype: "SlotTypeCode",
  typeslot: "SlotTypeCode",
  typeslotcode: "SlotTypeCode",
  roomno: "RoomNo",
  lecturer: "Lecturer",
};

const flexibleHeaderToField: Record<string, FlexibleField> = {
  groupname: "GroupName",
  subjectcode: "SubjectCode",
  date: "Date",
  starttime: "StartTime",
  endtime: "EndTime",
  roomno: "RoomNo",
  lecturer: "Lecturer",
};

const fieldAliasMap: Array<{ field: EditableField; aliases: string[] }> = [
  { field: "GroupName", aliases: ["groupname"] },
  { field: "SubjectCode", aliases: ["subjectcode"] },
  { field: "Date", aliases: ["date"] },
  { field: "SlotOrder", aliases: ["slotorder", "slot"] },
  {
    field: "SlotTypeCode",
    aliases: ["slottypecode", "slottype", "typeslotcode", "typeslot"],
  },
  { field: "RoomNo", aliases: ["roomno"] },
  { field: "Lecturer", aliases: ["lecturer"] },
];

export const resolveFieldFromText = (text: string): EditableField | null => {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, "");
  const exactMatch = fieldAliasMap.find((item) =>
    item.aliases.some(
      (alias) => normalized === alias || normalized.includes(alias)
    )
  );
  return exactMatch?.field ?? null;
};

const fieldFlexibleAliasMap: Array<{ field: FlexibleField; aliases: string[] }> = [
  { field: "GroupName", aliases: ["groupname"] },
  { field: "SubjectCode", aliases: ["subjectcode"] },
  { field: "Date", aliases: ["date"] },
  { field: "StartTime", aliases: ["starttime"] },
  { field: "EndTime", aliases: ["endtime"] },
  { field: "RoomNo", aliases: ["roomno"] },
  { field: "Lecturer", aliases: ["lecturer"] },
];

export const resolveFieldFlexibleFromText = (text: string): FlexibleField | null => {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, "");
  const exactMatch = fieldFlexibleAliasMap.find((item) =>
    item.aliases.some(
      (alias) => normalized === alias || normalized.includes(alias)
    )
  );
  return exactMatch?.field ?? null;
};


// File parsing
export const parseFileToRows = async (file: File): Promise<EditableRow[]> => {
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
    const mapped: EditableRow = {
      id: `row-${index + 1}`,
      GroupName: "",
      SubjectCode: "",
      Date: "",
      SlotOrder: "",
      SlotTypeCode: "",
      RoomNo: "",
      Lecturer: "",
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

export const parseFlexibleFileToRows = async (
  file: File
): Promise<FlexibleEditableRow[]> => {
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
    const mapped: FlexibleEditableRow = {
      id: `flex-row-${index + 1}`,
      GroupName: "",
      SubjectCode: "",
      Date: "",
      StartTime: "",
      EndTime: "",
      RoomNo: "",
      Lecturer: "",
    };

    Object.entries(row).forEach(([key, value]) => {
      const normalized = normalizeHeader(key);
      const field = flexibleHeaderToField[normalized];
      if (!field || field === "id") return;

      // Special handling for time fields - convert Excel time format
      if (field === "StartTime" || field === "EndTime") {
        mapped[field] = convertExcelTimeToTimeString(value);
      } else {
        mapped[field] = String(value ?? "").trim();
      }
    });

    return mapped;
  });
};

// Validation helpers
export const getErrorKey = (rowId: string, field: EditableField) =>
  `${rowId}:${field}`;

export const toFlexibleValidationKey = (
  rowId: string,
  field: FlexibleField
) => `${rowId}:${field}`;

export const pushRowIssue = (
  nextErrors: ValidationErrors,
  nextIssues: ValidationIssue[],
  rowId: string,
  rowNumber: number,
  field: EditableField,
  message: string
) => {
  nextErrors[`${rowId}:${field}`] = message;
  nextIssues.push({
    row: rowNumber,
    field: columnLabels[field],
    message,
  });
};

// Push row issue for flexible fields
export const pushFlexibleRowIssue = (
  nextErrors: ValidationErrors,
  nextIssues: ValidationIssue[],
  rowId: string,
  rowNumber: number,
  field: FlexibleField,
  message: string
) => {
  nextErrors[`${rowId}:${field}`] = message;
  nextIssues.push({
    row: rowNumber,
    field: flexibleColumnLabels[field],
    message,
  });
};

// Row conversion
export const toScheduleRows = (inputRows: EditableRow[]): ScheduleImportDto[] =>
  inputRows.map((row) => ({
    GroupName: row.GroupName.trim(),
    SubjectCode: row.SubjectCode.trim(),
    Date: row.Date.trim(),
    SlotOrder: Number.parseInt(row.SlotOrder.trim(), 10),
    SlotTypeCode: row.SlotTypeCode,
    RoomNo: row.RoomNo.trim(),
    Lecturer: row.Lecturer.trim(),
  }));

export const toFlexibleSlotRows = (
  inputRows: FlexibleEditableRow[]
): FlexibleSlotImportDto[] =>
  inputRows.map((row) => ({
    GroupName: row.GroupName.trim(),
    SubjectCode: row.SubjectCode.trim(),
    Date: row.Date.trim(),
    StartTime: row.StartTime.trim(),
    EndTime: row.EndTime.trim(),
    RoomNo: row.RoomNo.trim(),
    Lecturer: row.Lecturer.trim(),
  }));

// Validation logic
export const validateFixedRows = (
  rows: EditableRow[]
): { errors: ValidationErrors; issues: ValidationIssue[] } => {
  const nextErrors: ValidationErrors = {};
  const nextIssues: ValidationIssue[] = [];

  rows.forEach((row, rowIndex) => {
    (SCHEDULE_COLUMNS as unknown as EditableField[]).forEach((field) => {
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

    const parsedSlotOrder = Number.parseInt(row.SlotOrder.trim(), 10);
    const normalizedSlotTypeCode = normalizeSlotTypeCode(row.SlotTypeCode);

    if (!Number.isFinite(parsedSlotOrder) || parsedSlotOrder <= 0) {
      const key = getErrorKey(row.id, "SlotOrder");
      nextErrors[key] = "SlotOrder must be a positive number";
      nextIssues.push({
        row: rowIndex + 1,
        field: columnLabels.SlotOrder,
        message: "SlotOrder must be a positive number.",
      });
    }

    if (!normalizedSlotTypeCode) {
      const key = getErrorKey(row.id, "SlotTypeCode");
      nextErrors[key] = "SlotTypeCode is required";
      nextIssues.push({
        row: rowIndex + 1,
        field: columnLabels.SlotTypeCode,
        message: "SlotTypeCode is required.",
      });
    } else if (!allowedSlotTypes.has(normalizedSlotTypeCode)) {
      const key = getErrorKey(row.id, "SlotTypeCode");
      nextErrors[key] = "Use OLD_SLOT, NEW_SLOT or OUT_SLOT";
      nextIssues.push({
        row: rowIndex + 1,
        field: columnLabels.SlotTypeCode,
        message: "SlotTypeCode must be OLD_SLOT, NEW_SLOT or OUT_SLOT.",
      });
    }
  });

  return { errors: nextErrors, issues: nextIssues };
};

export const validateFlexibleRowsLocal = (
  rows: FlexibleEditableRow[]
): { errors: ValidationErrors; issues: ValidationIssue[] } => {
  const nextErrors: ValidationErrors = {};
  const nextIssues: ValidationIssue[] = [];

  rows.forEach((row, rowIndex) => {
    (FLEXIBLE_COLUMNS as unknown as FlexibleField[]).forEach((field) => {
      const value = row[field].trim();
      if (!value) {
        const key = toFlexibleValidationKey(row.id, field);
        nextErrors[key] = "Required";
        nextIssues.push({
          row: rowIndex + 1,
          field: flexibleColumnLabels[field],
          message: "Required field is missing.",
        });
      }
    });

    if (
      row.StartTime.trim() &&
      row.EndTime.trim() &&
      row.EndTime.trim() <= row.StartTime.trim()
    ) {
      const key = toFlexibleValidationKey(row.id, "EndTime");
      nextErrors[key] = "EndTime must be greater than StartTime";
      nextIssues.push({
        row: rowIndex + 1,
        field: flexibleColumnLabels.EndTime,
        message: "EndTime must be later than StartTime.",
      });
    }
  });

  return { errors: nextErrors, issues: nextIssues };
};
