import { useRef, useState, useMemo } from "react";
import type { EditableRow, ValidationIssue, ValidationErrors } from "../types/importBooking.type";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  SCHEDULE_COLUMNS,
  columnLabels,
  columnWidths,
} from "../constants/importBooking";
import {
  parseFileToRows,
  createEmptyRows,
  getErrorKey,
  toScheduleRows,
  validateFixedRows,
  resolveFieldFromText,
  pushRowIssue,
} from "../utils/importBookingUtils";
import type { ValidateImportQuery, CommitImportCommand } from "../types/importBooking.type";
import { useBookingImport } from "../hooks/useBookingImport";
import { useToast } from "../../../hooks/useToast";
import type { SemesterInfo } from "../../../utils/semester.util";

interface FixedImportPanelProps {
  onImportComplete?: () => void;
  semester: SemesterInfo;
}

const pageSize = 10;

export default function FixedImportPanel({ onImportComplete, semester }: FixedImportPanelProps) {
  const {
    validateScheduleRows,
    commitScheduleRows,
    validateScheduleMutation,
    commitScheduleMutation,
  } = useBookingImport();
  const toast = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string>("");
  const [hasValidated, setHasValidated] = useState(false);
  const [canCommit, setCanCommit] = useState(false);
  const [rows, setRows] = useState<EditableRow[]>(createEmptyRows(6));
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [modifiedCells, setModifiedCells] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmPanel, setShowConfirmPanel] = useState(false);

  const isValidating = validateScheduleMutation.isPending;
  const isUploading = commitScheduleMutation.isPending;

  const acceptedDisplay = useMemo(() => ACCEPTED_EXTENSIONS.join(", "), []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(rows.length / pageSize)),
    [rows.length]
  );

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage]);

  const pageMeta = useMemo(() => {
    if (rows.length === 0) return { start: 0, end: 0 };
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, rows.length);
    return { start, end };
  }, [rows.length, currentPage]);

  const validateFileFormat = (file: File): string | null => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      return `Unsupported format. Please upload ${acceptedDisplay}.`;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File size exceeds ${MAX_FILE_SIZE_MB}MB.`;
    }

    return null;
  };

  const resetImportState = () => {
    setIssues([]);
    setCanCommit(false);
    setHasValidated(false);
    setValidationErrors({});
    setModifiedCells({});
    setModalError("");
    setShowConfirmPanel(false);
    setRows(createEmptyRows(6));
    setCurrentPage(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelection = (file: File | null) => {
    setModalError("");
    setIssues([]);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const error = validateFileFormat(file);
    if (error) {
      setSelectedFile(null);
      setModalError(error);
      return;
    }

    // Check if same file is selected again
    if (
      selectedFile &&
      selectedFile.name === file.name &&
      selectedFile.size === file.size &&
      selectedFile.lastModified === file.lastModified
    ) {
      toast.info("File trùng", `File "${file.name}" đã được chọn trước đó.`);
      // Reset file input value to ensure onChange triggers on next file selection
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFile(file);
    // Reset file input value to ensure onChange triggers on next file selection
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onFileInputChange = (event: import("react").ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelection(file);
  };

  const onDrop: import("react").DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0] ?? null;
    handleFileSelection(file);
  };

  const onDragOver: import("react").DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave: import("react").DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);

    if (selectedFile) {
      resetImportState();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openEditModal = async () => {
    const file = selectedFile;
    if (!file || isUploading) return;

    resetImportState();

    try {
      const parsedRows = await parseFileToRows(file);
      if (parsedRows.length === 0) {
        setModalError("No data rows found in the uploaded file.");
        setIsModalOpen(true);
        return;
      }
      setRows(parsedRows);
      setCurrentPage(1);
      setIsModalOpen(true);
    } catch {
      setModalError("Unable to read the file. Please try again.");
      setIsModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setShowConfirmPanel(false);
  };

  const closeConfirmPanel = () => {
    setShowConfirmPanel(false);
  };

  const updateCell = (rowId: string, field: keyof EditableRow, value: string) => {
    if (field === "id") return;

    const key = getErrorKey(rowId, field as any);

    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );

    setModifiedCells((prev) => ({ ...prev, [key]: true }));

    // Reset validation state when cells are modified, forcing user to re-validate
    setCanCommit(false);
    setHasValidated(false);
    setValidationErrors({}); // Clear old validation errors
    setIssues([]); // Clear old issues
  };

  const validateRows = async () => {
    const { errors: clientErrors, issues: clientIssues } = validateFixedRows(
      rows
    );
    const nextErrors = { ...clientErrors };
    const nextIssues = [...clientIssues];

    setModalError(""); // Clear previous error before validating

    try {
      const payload: ValidateImportQuery = {
        Schedules: toScheduleRows(rows),
        StartTime: semester.startDate.toISOString(),
        EndTime: semester.endDate.toISOString()
      };

      const response = await validateScheduleRows(payload);

      // Handle both PascalCase and camelCase response from backend
      const rowsData = (response.Rows ?? (response as any).rows) ?? [];

      rowsData.forEach((rowResult: any) => {
        // Backend returns rowNumber as 0, use data.index instead for correct row number
        const rowNum = (rowResult.data?.index ?? rowResult.rowNumber ?? rowResult.RowNumber) ?? 0;
        const errorsData = rowResult.Errors ?? rowResult.errors ?? [];
        errorsData.forEach((error: any) => {
          const resolvedField =
            resolveFieldFromText(error.FieldName ?? error.fieldName ?? "") ??
            resolveFieldFromText(error.Message ?? error.message ?? "");

          const conflictWithRows = error.ConflictWithRows ?? error.conflictWithRows;
          const conflictSuffix = conflictWithRows?.length
            ? ` Conflict with rows: ${conflictWithRows.join(", ")}.`
            : "";
          const severity = error.Severity ?? error.severity;
          const message = `${error.Message ?? error.message}${conflictSuffix}`;

          // Always add error to nextIssues for display
          if (resolvedField && severity === 2) {
            pushRowIssue(
              nextErrors,
              nextIssues,
              String("row-" + rowNum),
              rowNum,
              resolvedField,
              message
            );
          } else {
            // Add to issues even if field couldn't be resolved
            nextIssues.push({
              row: rowNum,
              field: error.FieldName ?? error.fieldName ?? (severity === 1 ? "Warning" : "Error"),
              message,
            });
          }
        });
      });

      setCanCommit(response.CanCommit ?? (response as any).canCommit);
      setValidationErrors(nextErrors);
      setIssues(nextIssues);
      setHasValidated(true);

      const canCommitValue = response.CanCommit ?? (response as any).canCommit;

      if (canCommitValue) {
        // Can proceed - clear error message
        setModalError("");
      } else {
        // Cannot proceed - show critical error
        setModalError("Validation found critical issues. Please fix rows before import.");
      }
    } catch {
      setCanCommit(false);
      setValidationErrors(nextErrors);
      setIssues(nextIssues);
      setHasValidated(true);
      setModalError("Unable to validate import data. Please try again.");
    }
  };

  const confirmImport = async () => {
    if (!selectedFile || isUploading || !hasValidated || !canCommit) return;

    try {
      const payload: CommitImportCommand = {
        Schedules: toScheduleRows(rows),
        StartTime: semester.startDate.toISOString(),
        EndTime: semester.endDate.toISOString()
      };

      const response = await commitScheduleRows(payload);

      // Handle both PascalCase and camelCase response from backend
      const isSuccess = (response as any).Success ?? (response as any).success;
      const message = (response as any).Message ?? (response as any).message;

      if (isSuccess) {
        toast.success("Import thành công!", "Dữ liệu đã được nhập vào hệ thống.");
        setModalError("");
        setShowConfirmPanel(false);
        setIsModalOpen(false);
        setSelectedFile(null);
        resetImportState();
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        const errorMsg = message || "Import thất bại. Vui lòng kiểm tra lại dữ liệu.";
        setModalError(errorMsg);
        toast.error("Import thất bại", errorMsg);
      }
    } catch (error) {
      const errorMsg = "Import thất bại. Vui lòng kiểm tra lại dữ liệu và thử lại.";
      setModalError(errorMsg);
      toast.error("Lỗi import", errorMsg);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={onFileInputChange}
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Fixed Import
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Columns: GroupName, SubjectCode, Date, SlotOrder, SlotTypeCode, RoomNo, Lecturer.
          </p>
        </div>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-6 text-center transition",
          isDragging
            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10"
            : "border-gray-300 hover:border-brand-400 dark:border-gray-600 dark:hover:border-brand-500",
        ].join(" ")}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Drag and drop fixed import file here
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {acceptedDisplay} - max {MAX_FILE_SIZE_MB}MB
        </p>
        {selectedFile && (
          <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">
            Selected: {selectedFile.name}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={clearSelection}
          disabled={!selectedFile || isUploading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={openEditModal}
          disabled={!selectedFile || isUploading}
          className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start Upload
        </button>
      </div>

      {isModalOpen && (
        <EditModal
          rows={paginatedRows}
          pageMeta={pageMeta}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          validationErrors={validationErrors}
          modifiedCells={modifiedCells}
          hasValidated={hasValidated}
          canCommit={canCommit}
          isValidating={isValidating}
          isUploading={isUploading}
          onUpdateCell={updateCell}
          onValidate={validateRows}
          onConfirm={() => setShowConfirmPanel(true)}
          onClose={closeEditModal}
          onConfirmImport={confirmImport}
          onCancelConfirm={closeConfirmPanel}
          showConfirmPanel={showConfirmPanel}
          issues={issues}
          selectedFileName={selectedFile?.name ?? ""}
          rowCount={rows.length}
          modalError={modalError}
        />
      )}
    </div>
  );
}

interface EditModalProps {
  rows: EditableRow[];
  pageMeta: { start: number; end: number };
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  validationErrors: ValidationErrors;
  modifiedCells: Record<string, boolean>;
  hasValidated: boolean;
  canCommit: boolean;
  isValidating: boolean;
  isUploading: boolean;
  onUpdateCell: (rowId: string, field: keyof EditableRow, value: string) => void;
  onValidate: () => void;
  onConfirm: () => void;
  onClose: () => void;
  onConfirmImport: () => void;
  onCancelConfirm: () => void;
  showConfirmPanel: boolean;
  issues: ValidationIssue[];
  selectedFileName: string;
  rowCount: number;
  modalError: string;
}

function EditModal({
  rows,
  pageMeta,
  totalPages,
  currentPage,
  onPageChange,
  validationErrors,
  modifiedCells,
  hasValidated,
  canCommit,
  isValidating,
  isUploading,
  onUpdateCell,
  onValidate,
  onConfirm,
  onClose,
  onConfirmImport,
  onCancelConfirm,
  showConfirmPanel,
  issues,
  selectedFileName,
  rowCount,
  modalError,
}: EditModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative z-10 w-[92vw] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900">
          <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Review and Edit Schedule Data
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Update imported rows and validate before confirming import.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>

          <div className="max-h-[60vh] overflow-auto px-6 py-4">
            {isValidating && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
                <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500 dark:border-gray-600 dark:border-t-brand-400" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Validating data...
                  </p>
                </div>
              </div>
            )}

            <div className="mb-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Mode: Fixed Import | File: {selectedFileName} | Rows: {rowCount}
            </div>

            {modalError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-xs font-semibold text-red-800 dark:text-red-200">
                  Error
                </p>
                <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                  {modalError}
                </p>
              </div>
            )}

            <DataTable
              rows={rows}
              validationErrors={validationErrors}
              modifiedCells={modifiedCells}
              hasValidated={hasValidated}
              onUpdateCell={onUpdateCell}
              pageMeta={pageMeta}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Showing {pageMeta.start}-{pageMeta.end} / {rowCount} rows (Page{" "}
                {currentPage}/{totalPages})
              </span>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              {hasValidated
                ? canCommit
                  ? "Validation passed. You can confirm the import."
                  : "Validation found critical issues. Please fix rows before confirming import."
                : "Click Validate before confirming import."}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onValidate}
                disabled={isValidating || isUploading || rows.length === 0}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {isValidating ? "Validating..." : "Validate"}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!hasValidated || !canCommit || isUploading || isValidating}
                className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmPanel && (
        <ConfirmPanel
          issues={issues}
          isUploading={isUploading}
          onConfirm={onConfirmImport}
          onClose={onCancelConfirm}
        />
      )}
    </>
  );
}

interface DataTableProps {
  rows: EditableRow[];
  validationErrors: ValidationErrors;
  modifiedCells: Record<string, boolean>;
  hasValidated: boolean;
  onUpdateCell: (rowId: string, field: keyof EditableRow, value: string) => void;
  pageMeta: { start: number; end: number };
}

function DataTable({
  rows,
  validationErrors,
  modifiedCells,
  hasValidated,
  onUpdateCell,
  pageMeta,
}: DataTableProps) {
  return (
    <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-full table-fixed divide-y divide-gray-200 text-xs dark:divide-gray-700">
        <colgroup>
          <col style={{ width: "64px" }} />
          {SCHEDULE_COLUMNS.map((column) => (
            <col key={`col-${column}`} style={{ width: columnWidths[column as keyof typeof columnWidths] }} />
          ))}
        </colgroup>
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
              #
            </th>
            {SCHEDULE_COLUMNS.map((column) => (
              <th
                key={column}
                className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300"
              >
                {columnLabels[column as keyof typeof columnLabels]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row, rowIndex) => {
            const absoluteRowIndex = pageMeta.start - 1 + rowIndex;
            return (
              <TableRow
                key={row.id}
                row={row}
                rowNumber={absoluteRowIndex + 1}
                validationErrors={validationErrors}
                modifiedCells={modifiedCells}
                hasValidated={hasValidated}
                onUpdateCell={onUpdateCell}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface TableRowProps {
  row: EditableRow;
  rowNumber: number;
  validationErrors: ValidationErrors;
  modifiedCells: Record<string, boolean>;
  hasValidated: boolean;
  onUpdateCell: (rowId: string, field: keyof EditableRow, value: string) => void;
}

function TableRow({
  row,
  rowNumber,
  validationErrors,
  modifiedCells,
  hasValidated,
  onUpdateCell,
}: TableRowProps) {
  if (rowNumber === 9) {
    console.log("Validation errors for row", rowNumber, validationErrors); // Debug log to inspect validation errors for this row
  }
  return (
    <tr>
      <td className="px-3 py-2 align-top text-gray-500 dark:text-gray-400">
        {rowNumber}
      </td>
      {SCHEDULE_COLUMNS.map((column) => {
        const field = column as keyof EditableRow;
        const errorKey = getErrorKey(row.id, field);
        const hasError = Boolean(validationErrors[errorKey]);
        const isModified = Boolean(modifiedCells[errorKey]);
        const isValidatedSuccess = hasValidated && isModified && !hasError;
        if (rowNumber === 9) {
          console.log(` Row ${rowNumber} - Field: ${field}, ErrorKey: ${errorKey}, HasError: ${hasError}, IsModified: ${isModified}, IsValidatedSuccess: ${isValidatedSuccess}`); // Debug log to inspect cell state for this row
          console.log(`row field : ${row} | ValidationErrors:`); // Debug log to inspect validation errors object for this row
        }

        return (
          <td key={`${row.id}-${column}`} className="relative px-2 py-2 align-top">
            <div className="relative">
              <input
                value={row[field]}
                onChange={(event) => onUpdateCell(row.id, field, event.target.value)}
                title={row[field]}
                className={[
                  "w-full rounded-md border px-2 py-1 text-xs transition",
                  hasError
                    ? "border-red-400 bg-red-50 text-red-700"
                    : isValidatedSuccess
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : isModified
                        ? "border-amber-400 bg-amber-50 text-amber-800"
                        : "border-gray-200 bg-white text-gray-700",
                  "focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-400",
                  "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
                  hasError
                    ? "dark:border-red-500 dark:bg-red-950"
                    : isValidatedSuccess
                      ? "dark:border-emerald-500 dark:bg-emerald-950"
                      : isModified
                        ? "dark:border-amber-500 dark:bg-amber-950"
                        : "",
                ].join(" ")}
                placeholder={`Row ${rowNumber}`}
              />
              {hasError && (
                <div
                  className="group absolute right-0.5 top-0.5 cursor-help"
                  title={validationErrors[errorKey]}
                >
                  <svg
                    className="h-4 w-4 text-red-500 hover:text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="invisible absolute bottom-full right-0 mb-2 w-max rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover:visible dark:bg-gray-700">
                    {validationErrors[errorKey]}
                  </div>
                </div>
              )}
            </div>
            {!hasError && isModified && !hasValidated && (
              <p className="mt-1 text-[10px] font-medium text-amber-600">Modified</p>
            )}
            {!hasError && isModified && hasValidated && (
              <p className="mt-1 text-[10px] font-medium text-emerald-600">Modified - Valid</p>
            )}
          </td>
        );
      })}
    </tr>
  );
}

interface ConfirmPanelProps {
  issues: ValidationIssue[];
  isUploading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmPanel({ issues, isUploading, onConfirm, onClose }: ConfirmPanelProps) {
  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Confirm Import
          </h3>
        </div>
        <div className="max-h-[300px] overflow-auto px-6 py-4">
          {issues.length > 0 && (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                Warnings ({issues.length}):
              </p>
              <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-300">
                {issues.slice(0, 5).map((issue, idx) => (
                  <li key={idx}>
                    Row {issue.row}: {issue.field} - {issue.message}
                  </li>
                ))}
                {issues.length > 5 && <li>... and {issues.length - 5} more</li>}
              </ul>
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to import these rows?
          </p>
        </div>
        <div className="flex gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isUploading}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "Importing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
