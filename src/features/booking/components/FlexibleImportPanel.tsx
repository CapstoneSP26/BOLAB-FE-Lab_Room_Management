import { useRef, useState, useMemo } from "react";
import type {
  FlexibleEditableRow,
  ValidationErrors,
} from "../types/importBooking.type";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  FLEXIBLE_COLUMNS,
  flexibleColumnLabels,
  flexibleColumnWidths,
} from "../constants/importBooking";
import {
  parseFlexibleFileToRows,
  createEmptyFlexibleRows,
  toFlexibleValidationKey,
  validateFlexibleRowsLocal,
  toFlexibleSlotRows,
  resolveFieldFlexibleFromText,
  pushFlexibleRowIssue,
} from "../utils/importBookingUtils";
import type {
  ValidateFlexibleSlotImportRequest,
  CommitFlexibleSlotImportRequest,
} from "../types/importBooking.type";
import { useBookingFlexibleImport } from "../hooks/useBookingFlexibleImport";
import { useToast } from "../../../hooks/useToast";
import type { SemesterInfo } from "../../../utils/semester.util";

interface FlexibleImportPanelProps {
  onImportComplete?: () => void;
  semester: SemesterInfo;
  editingBatchId?: string | null; // Thêm prop để nhận batch đang chỉnh sửa (nếu có)
}

const pageSize = 10;

export default function FlexibleImportPanel({
  onImportComplete,
  semester,
  editingBatchId,
}: FlexibleImportPanelProps) {
  const toast = useToast();
  const {
    validateFlexibleScheduleMutation,
    commitFlexibleScheduleMutation,
  } = useBookingFlexibleImport();
  const flexibleFileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFlexibleFile, setSelectedFlexibleFile] = useState<File | null>(null);
  const [isDraggingFlexible, setIsDraggingFlexible] = useState(false);
  const [flexibleRows, setFlexibleRows] = useState<FlexibleEditableRow[]>(
    createEmptyFlexibleRows(6)
  );
  const [flexibleValidationErrors, setFlexibleValidationErrors] =
    useState<ValidationErrors>({});
  const [flexibleCurrentPage, setFlexibleCurrentPage] = useState(1);
  const [showFlexibleConfirmPanel, setShowFlexibleConfirmPanel] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [canCommit, setCanCommit] = useState(false);
  const [flexibleModalError, setFlexibleModalError] = useState<string>("");

  const isValidating = validateFlexibleScheduleMutation.isPending;
  const isUploading = commitFlexibleScheduleMutation.isPending;

  const acceptedDisplay = useMemo(() => ACCEPTED_EXTENSIONS.join(", "), []);

  const flexibleTotalPages = useMemo(
    () => Math.max(1, Math.ceil(flexibleRows.length / pageSize)),
    [flexibleRows.length]
  );

  const paginatedRows = useMemo(() => {
    const start = (flexibleCurrentPage - 1) * pageSize;
    return flexibleRows.slice(start, start + pageSize);
  }, [flexibleRows, flexibleCurrentPage]);

  const flexiblePageMeta = useMemo(() => {
    if (flexibleRows.length === 0) return { start: 0, end: 0 };
    const start = (flexibleCurrentPage - 1) * pageSize + 1;
    const end = Math.min(flexibleCurrentPage * pageSize, flexibleRows.length);
    return { start, end };
  }, [flexibleRows.length, flexibleCurrentPage]);

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

  const resetFlexibleImportState = () => {
    setCanCommit(false);
    setHasValidated(false);
    setFlexibleValidationErrors({});
    setFlexibleModalError("");
    setShowFlexibleConfirmPanel(false);
    setFlexibleRows(createEmptyFlexibleRows(6));
    setFlexibleCurrentPage(1);
    if (flexibleFileInputRef.current) {
      flexibleFileInputRef.current.value = "";
    }
  };

  const handleFlexibleFileSelection = (file: File | null) => {
    setFlexibleModalError("");

    if (!file) {
      setSelectedFlexibleFile(null);
      return;
    }

    const error = validateFileFormat(file);
    if (error) {
      setSelectedFlexibleFile(null);
      setFlexibleModalError(error);
      return;
    }

    // Check if same file is selected again
    if (
      selectedFlexibleFile &&
      selectedFlexibleFile.name === file.name &&
      selectedFlexibleFile.size === file.size &&
      selectedFlexibleFile.lastModified === file.lastModified
    ) {
      toast.info("File trùng", `File "${file.name}" đã được chọn trước đó.`);
      // Reset file input value to ensure onChange triggers on next file selection
      if (flexibleFileInputRef.current) {
        flexibleFileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFlexibleFile(file);
    // Reset file input value to ensure onChange triggers on next file selection
    if (flexibleFileInputRef.current) {
      flexibleFileInputRef.current.value = "";
    }
  };

  const onFlexibleFileInputChange = (
    event: import("react").ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    handleFlexibleFileSelection(file);
  };

  const onFlexibleDrop: import("react").DragEventHandler<HTMLDivElement> = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFlexible(false);

    const file = event.dataTransfer.files?.[0] ?? null;
    handleFlexibleFileSelection(file);
  };

  const onFlexibleDragOver: import("react").DragEventHandler<HTMLDivElement> = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFlexible(true);
  };

  const onFlexibleDragLeave: import("react").DragEventHandler<HTMLDivElement> = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFlexible(false);
  };

  const clearFlexibleSelection = () => {
    setSelectedFlexibleFile(null);

    if (selectedFlexibleFile) {
      resetFlexibleImportState();
    }

    if (flexibleFileInputRef.current) {
      flexibleFileInputRef.current.value = "";
    }
  };

  const openFlexibleEditModal = async () => {
    const file = selectedFlexibleFile;
    if (!file || isUploading) return;

    resetFlexibleImportState();

    try {
      const parsedRows = await parseFlexibleFileToRows(file);
      if (parsedRows.length === 0) {
        setFlexibleModalError("No data rows found in the uploaded file.");
        setShowFlexibleConfirmPanel(true);
        return;
      }
      setFlexibleRows(parsedRows);
      setFlexibleCurrentPage(1);
      setShowFlexibleConfirmPanel(true);
    } catch {
      setFlexibleModalError("Unable to read the file. Please try again.");
      setShowFlexibleConfirmPanel(true);
    }
  };

  const closeFlexibleEditModal = () => {
    setShowFlexibleConfirmPanel(false);
  };

  const validateFlexibleRows = async () => {
    const { errors: clientErrors, issues: clientIssues } = validateFlexibleRowsLocal(
      flexibleRows
    );
    const nextErrors = { ...clientErrors };
    const nextIssues = [...clientIssues];

    setFlexibleModalError(""); // Clear previous error before validating

    try {
      const payload: ValidateFlexibleSlotImportRequest = {
        Schedules: toFlexibleSlotRows(flexibleRows),
        StartTime: semester.startDate.toISOString(),
        EndTime: semester.endDate.toISOString(),
        ImportBatchId: editingBatchId,
      };

      const response = await validateFlexibleScheduleMutation.mutateAsync(payload);

      // Handle both PascalCase and camelCase response from backend
      const rowsData = (response.Rows ?? (response as any).rows) ?? [];

      rowsData.forEach((rowResult: any) => {
        // Backend returns rowNumber as 0, use data.index instead for correct row number
        const rowNum = (rowResult.data?.index ?? rowResult.rowNumber ?? rowResult.RowNumber) ?? 0;
        const errorsData = rowResult.Errors ?? rowResult.errors ?? [];
        errorsData.forEach((error: any) => {
          const resolvedField =
            resolveFieldFlexibleFromText(error.FieldName ?? error.fieldName ?? "") ??
            resolveFieldFlexibleFromText(error.Message ?? error.message ?? "");

          const conflictWithRows = error.ConflictWithRows ?? error.conflictWithRows;
          const conflictSuffix = conflictWithRows?.length
            ? ` Conflict with rows: ${conflictWithRows.join(", ")}.`
            : "";
          const severity = error.Severity ?? error.severity;
          const message = `${error.Message ?? error.message}${conflictSuffix}`;

          // Always add error to nextIssues for display
          if (resolvedField && severity === 2) {
            pushFlexibleRowIssue(
              nextErrors,
              nextIssues,
              String("flex-row-" + rowNum),
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
      setFlexibleValidationErrors(nextErrors);
      setHasValidated(true);

      const canCommitValue = response.CanCommit ?? (response as any).canCommit;

      if (canCommitValue) {
        // Can proceed - clear error message
        setFlexibleModalError("");
      } else {
        // Cannot proceed - show critical error
        setFlexibleModalError("Validation found critical issues. Please fix rows before import.");
      }
    } catch {
      setCanCommit(false);
      setFlexibleValidationErrors(nextErrors);
      setHasValidated(true);
      setFlexibleModalError("Unable to validate import data. Please try again.");
    }
  };

  const confirmFlexibleImport = async () => {
    if (!selectedFlexibleFile || isUploading || !hasValidated || !canCommit) return;

    try {
      const payload: CommitFlexibleSlotImportRequest = {
        Schedules: toFlexibleSlotRows(flexibleRows),
        StartTime: semester.startDate.toISOString(),
        EndTime: semester.endDate.toISOString(),
        ImportBatchId: editingBatchId,
        BatchName: selectedFlexibleFile.name,
      };

      const response = await commitFlexibleScheduleMutation.mutateAsync(payload);

      // Handle both PascalCase and camelCase response from backend
      const isSuccess = (response as any).Success ?? (response as any).success;
      const message = (response as any).Message ?? (response as any).message;

      if (isSuccess) {
        toast.success("Import thành công!", "Dữ liệu đã được nhập vào hệ thống.");
        setFlexibleModalError("");
        setShowFlexibleConfirmPanel(false);
        setSelectedFlexibleFile(null);
        resetFlexibleImportState();
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        const errorMsg = message || "Import thất bại. Vui lòng kiểm tra lại dữ liệu.";
        setFlexibleModalError(errorMsg);
        toast.error("Import thất bại", errorMsg);
      }
    } catch (error) {
      const errorMsg = "Import thất bại. Vui lòng kiểm tra lại dữ liệu và thử lại.";
      setFlexibleModalError(errorMsg);
      toast.error("Lỗi import", errorMsg);
    }
  };

  const updateFlexibleCell = (
    rowId: string,
    field: keyof FlexibleEditableRow,
    value: string
  ) => {
    if (field === "id") return;

    setFlexibleRows((prev: FlexibleEditableRow[]) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );

    // Reset validation state when cells are modified, forcing user to re-validate
    setFlexibleValidationErrors({});
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <input
        ref={flexibleFileInputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={onFlexibleFileInputChange}
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Flexible Import
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Columns: GroupName, SubjectCode, Date, StartTime, EndTime, RoomNo, Lecturer.
          </p>
        </div>
      </div>

      <div
        onDrop={onFlexibleDrop}
        onDragOver={onFlexibleDragOver}
        onDragLeave={onFlexibleDragLeave}
        className={[
          "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-6 text-center transition",
          isDraggingFlexible
            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10"
            : "border-gray-300 hover:border-brand-400 dark:border-gray-600 dark:hover:border-brand-500",
        ].join(" ")}
        onClick={() => flexibleFileInputRef.current?.click()}
      >
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Drag and drop flexible file here
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {acceptedDisplay} - max {MAX_FILE_SIZE_MB}MB
        </p>
        {selectedFlexibleFile && (
          <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">
            Selected: {selectedFlexibleFile.name}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={clearFlexibleSelection}
          disabled={!selectedFlexibleFile || isUploading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={openFlexibleEditModal}
          disabled={!selectedFlexibleFile || isUploading}
          className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start Upload
        </button>
      </div>

      {showFlexibleConfirmPanel && (
        <FlexibleEditModal
          rows={paginatedRows}
          flexiblePageMeta={flexiblePageMeta}
          flexibleTotalPages={flexibleTotalPages}
          flexibleCurrentPage={flexibleCurrentPage}
          onPageChange={setFlexibleCurrentPage}
          validationErrors={flexibleValidationErrors}
          hasValidated={hasValidated}
          canCommit={canCommit}
          isValidating={isValidating}
          isUploading={isUploading}
          onUpdateCell={updateFlexibleCell}
          onValidate={validateFlexibleRows}
          onClose={closeFlexibleEditModal}
          onConfirmImport={confirmFlexibleImport}
          selectedFileName={selectedFlexibleFile?.name ?? ""}
          rowCount={flexibleRows.length}
          modalError={flexibleModalError}
        />
      )}
    </div>
  );
}

interface FlexibleEditModalProps {
  rows: FlexibleEditableRow[];
  flexiblePageMeta: { start: number; end: number };
  flexibleTotalPages: number;
  flexibleCurrentPage: number;
  onPageChange: (page: number) => void;
  validationErrors: ValidationErrors;
  hasValidated: boolean;
  canCommit: boolean;
  isValidating: boolean;
  isUploading: boolean;
  onUpdateCell: (
    rowId: string,
    field: keyof FlexibleEditableRow,
    value: string
  ) => void;
  onValidate: () => void;
  onClose: () => void;
  onConfirmImport: () => void;
  selectedFileName: string;
  rowCount: number;
  modalError: string;
}

function FlexibleEditModal({
  rows,
  flexiblePageMeta,
  flexibleTotalPages,
  flexibleCurrentPage,
  onPageChange,
  validationErrors,
  hasValidated,
  canCommit,
  isValidating,
  isUploading,
  onUpdateCell,
  onValidate,
  onClose,
  onConfirmImport,
  selectedFileName,
  rowCount,
  modalError,
}: FlexibleEditModalProps) {
  const paginatedRows = rows.slice(
    (flexibleCurrentPage - 1) * pageSize,
    flexibleCurrentPage * pageSize
  );

  return (
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative z-10 w-[92vw] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900">
          <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Review and Edit Flexible Schedule Data
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
              Mode: Flexible Import | File: {selectedFileName} | Rows: {rowCount}
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

            <FlexibleDataTable
              rows={paginatedRows}
              validationErrors={validationErrors}
              onUpdateCell={onUpdateCell}
              flexiblePageMeta={flexiblePageMeta}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, flexibleCurrentPage - 1))}
                disabled={flexibleCurrentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Showing {flexiblePageMeta.start}-{flexiblePageMeta.end} / {rowCount} rows (Page{" "}
                {flexibleCurrentPage}/{flexibleTotalPages})
              </span>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(flexibleTotalPages, flexibleCurrentPage + 1))}
                disabled={flexibleCurrentPage === flexibleTotalPages}
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
                onClick={onConfirmImport}
                disabled={!hasValidated || !canCommit || isUploading || isValidating}
                className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface FlexibleDataTableProps {
  rows: FlexibleEditableRow[];
  validationErrors: ValidationErrors;
  onUpdateCell: (
    rowId: string,
    field: keyof FlexibleEditableRow,
    value: string
  ) => void;
  flexiblePageMeta: { start: number; end: number };
}

function FlexibleDataTable({
  rows,
  validationErrors,
  onUpdateCell,
  flexiblePageMeta,
}: FlexibleDataTableProps) {
  return (
    <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-full table-fixed divide-y divide-gray-200 text-xs dark:divide-gray-700">
        <colgroup>
          <col style={{ width: "64px" }} />
          {FLEXIBLE_COLUMNS.map((column) => (
            <col
              key={`flex-col-${column}`}
              style={{
                width: flexibleColumnWidths[column as keyof typeof flexibleColumnWidths],
              }}
            />
          ))}
        </colgroup>
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
              #
            </th>
            {FLEXIBLE_COLUMNS.map((column) => (
              <th
                key={column}
                className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300"
              >
                {flexibleColumnLabels[column as keyof typeof flexibleColumnLabels]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row, rowIndex) => {
            const absoluteRowIndex = flexiblePageMeta.start - 1 + rowIndex;
            return (
              <FlexibleTableRow
                key={row.id}
                row={row}
                rowNumber={absoluteRowIndex + 1}
                validationErrors={validationErrors}
                onUpdateCell={onUpdateCell}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface FlexibleTableRowProps {
  row: FlexibleEditableRow;
  rowNumber: number;
  validationErrors: ValidationErrors;
  onUpdateCell: (
    rowId: string,
    field: keyof FlexibleEditableRow,
    value: string
  ) => void;
}

function FlexibleTableRow({
  row,
  rowNumber,
  validationErrors,
  onUpdateCell,
}: FlexibleTableRowProps) {
  return (
    <tr>
      <td className="px-3 py-2 align-top text-gray-500 dark:text-gray-400">
        {rowNumber}
      </td>
      {FLEXIBLE_COLUMNS.map((column) => {
        const field = column as keyof FlexibleEditableRow;
        const errorKey = toFlexibleValidationKey(row.id, field);
        const hasError = Boolean(validationErrors[errorKey]);

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
                    : "border-gray-200 bg-white text-gray-700",
                  "focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-400",
                  "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
                  hasError ? "dark:border-red-500 dark:bg-red-950" : "",
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
          </td>
        );
      })}
    </tr>
  );
}
