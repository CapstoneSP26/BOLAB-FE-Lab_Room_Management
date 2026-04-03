import { ErrorSeverity } from "../types/importBooking.type";
import type {
  ScheduleImportDto,
  FlexibleSlotImportDto,
  OldNewSlotImportDto,
  CommitScheduleImportResponse,
  ImportValidationResult,
  RowResult,
  RowError,
} from "../types/importBooking.type";

const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const isValidIsoDate = (value: string): boolean => {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const validateCommonFields = <T extends {
  GroupName: string;
  SubjectCode: string;
  Date: string;
  RoomNo: string;
  Lecturer: string;
}>(
  row: T,
): { errors: RowError[]; isCritical: boolean; hasWarning: boolean } => {
  const errors: RowError[] = [];
  let isCritical = false;
  let hasWarning = false;

  if (!row.GroupName.trim()) {
    errors.push({ FieldName: "GroupName", Message: "GroupName is required.", Severity: ErrorSeverity.Error });
    isCritical = true;
  }

  if (!row.SubjectCode.trim()) {
    errors.push({ FieldName: "SubjectCode", Message: "SubjectCode is required.", Severity: ErrorSeverity.Error });
    isCritical = true;
  }

  if (!row.Date.trim()) {
    errors.push({ FieldName: "Date", Message: "Date is required.", Severity: ErrorSeverity.Error });
    isCritical = true;
  } else if (!isValidIsoDate(row.Date.trim())) {
    errors.push({ FieldName: "Date", Message: "Date is invalid. Use yyyy-mm-dd or ISO date.", Severity: ErrorSeverity.Error });
    isCritical = true;
  }

  if (!row.RoomNo.trim()) {
    errors.push({ FieldName: "RoomNo", Message: "RoomNo is required.", Severity: ErrorSeverity.Error });
    isCritical = true;
  }

  if (!row.Lecturer.trim()) {
    errors.push({ FieldName: "Lecturer", Message: "Lecturer is missing.", Severity: ErrorSeverity.Warning });
    hasWarning = true;
  }

  return { errors, isCritical, hasWarning };
};

const validateScheduleRow = (
  row: ScheduleImportDto,
  rowNumber: number,
): RowResult<ScheduleImportDto> => {
  const { errors, isCritical: commonCritical, hasWarning: commonWarning } = validateCommonFields(row);
  let isCritical = commonCritical;
  let hasWarning = commonWarning;

  if (!Number.isFinite(row.SlotOrder) || row.SlotOrder <= 0) {
    errors.push({ FieldName: "SlotOrder", Message: "SlotOrder must be a positive number.", Severity: ErrorSeverity.Error });
    isCritical = true;
  }

  const normalizedSlotTypeCode = row.SlotTypeCode.trim().toUpperCase().replace(/[-\s]+/g, "_");
  if (!normalizedSlotTypeCode) {
    errors.push({ FieldName: "SlotTypeCode", Message: "SlotTypeCode is required.", Severity: ErrorSeverity.Error });
    isCritical = true;
  } else if (!["OLD_SLOT", "NEW_SLOT", "OUT_SLOT"].includes(normalizedSlotTypeCode)) {
    errors.push({ FieldName: "SlotTypeCode", Message: "SlotTypeCode must be OLD_SLOT, NEW_SLOT or OUT_SLOT.", Severity: ErrorSeverity.Error });
    isCritical = true;
  }

  return {
    RowNumber: rowNumber,
    Data: row,
    Errors: errors,
    IsCritical: isCritical,
    HasWarning: hasWarning,
  };
};

const toImportResult = <T,>(rows: RowResult<T>[]): ImportValidationResult<T> => ({
  Rows: rows,
  TotalRows: rows.length,
  ErrorCount: rows.filter((row) => row.IsCritical).length,
  CanCommit: !rows.some((row) => row.IsCritical),
});

export const validateScheduleImportMock = async (
  rows: ScheduleImportDto[],
): Promise<ImportValidationResult<ScheduleImportDto>> => {
  await sleep();

  const results = rows.map((row, index) => validateScheduleRow(row, index + 1));

  return toImportResult(results);
};

export const validateOldNewSlotImportMock = async (
  rows: OldNewSlotImportDto[],
): Promise<ImportValidationResult<OldNewSlotImportDto>> => {
  await sleep();

  const results = rows.map((row, index) => ({
    RowNumber: index + 1,
    Data: row,
    Errors: [],
    IsCritical: false,
    HasWarning: false,
  }));

  return toImportResult(results);
};

export const validateFlexibleSlotImportMock = async (
  rows: FlexibleSlotImportDto[],
): Promise<ImportValidationResult<FlexibleSlotImportDto>> => {
  await sleep();

  const results = rows.map((row, index) => ({
    RowNumber: index + 1,
    Data: row,
    Errors: [],
    IsCritical: false,
    HasWarning: false,
  }));

  return toImportResult(results);
};

export const commitScheduleImportMock = async (
  rows: ScheduleImportDto[],
): Promise<CommitScheduleImportResponse> => {
  await sleep(700);

  const validation = await validateScheduleImportMock(rows);
  const failedCount = validation.Rows.filter((row) => row.IsCritical).length;

  return {
    Success: failedCount === 0,
    ImportedCount: rows.length - failedCount,
    FailedCount: failedCount,
    Message:
      failedCount === 0
        ? "Schedule import completed successfully."
        : `Schedule import completed with ${failedCount} failed row(s).`,
  };
};

export const commitOldNewSlotImportMock = async (
  rows: OldNewSlotImportDto[],
): Promise<CommitScheduleImportResponse> => commitScheduleImportMock(
  rows.map((row) => ({
    GroupName: row.GroupName,
    SubjectCode: row.SubjectCode,
    Date: row.Date,
    SlotOrder: row.Slot,
    SlotTypeCode: row.TypeSlot,
    RoomNo: row.RoomNo,
    Lecturer: row.Lecturer,
  })),
);

export const commitFlexibleSlotImportMock = async (
  rows: FlexibleSlotImportDto[],
): Promise<CommitScheduleImportResponse> => commitScheduleImportMock(
  rows.map((row) => ({
    GroupName: row.GroupName,
    SubjectCode: row.SubjectCode,
    Date: row.Date,
    SlotOrder: 1,
    SlotTypeCode: "OLD_SLOT",
    RoomNo: row.RoomNo,
    Lecturer: row.Lecturer,
  })),
);
