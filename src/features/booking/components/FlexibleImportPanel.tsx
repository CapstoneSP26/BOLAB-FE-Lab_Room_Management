import { useRef, useState, useMemo } from "react";
import type {
  FlexibleEditableRow,
  ValidationIssue,
  ValidationErrors,
  UploadResultType,
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
} from "../utils/importBookingUtils";

interface FlexibleImportPanelProps {
  onImportComplete?: () => void;
}

const pageSize = 10;

export default function FlexibleImportPanel({
  onImportComplete,
}: FlexibleImportPanelProps) {
  const flexibleFileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFlexibleFile, setSelectedFlexibleFile] = useState<File | null>(null);
  const [isDraggingFlexible, setIsDraggingFlexible] = useState(false);
  const [resultType, setResultType] = useState<UploadResultType>("idle");
  const [resultMessage, setResultMessage] = useState<string>("");
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [flexibleRows, setFlexibleRows] = useState<FlexibleEditableRow[]>(
    createEmptyFlexibleRows(6)
  );
  const [flexibleValidationErrors, setFlexibleValidationErrors] =
    useState<ValidationErrors>({});
  const [flexibleCurrentPage, setFlexibleCurrentPage] = useState(1);
  const [showFlexibleConfirmPanel, setShowFlexibleConfirmPanel] = useState(false);

  const acceptedDisplay = useMemo(() => ACCEPTED_EXTENSIONS.join(", "), []);

  const flexibleTotalPages = useMemo(
    () => Math.max(1, Math.ceil(flexibleRows.length / pageSize)),
    [flexibleRows.length]
  );

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
    setFlexibleValidationErrors({});
    setShowFlexibleConfirmPanel(false);
  };

  const handleFlexibleFileSelection = (file: File | null) => {
    setResultType("idle");
    setResultMessage("");
    setIssues([]);

    if (!file) {
      setSelectedFlexibleFile(null);
      return;
    }

    const error = validateFileFormat(file);
    if (error) {
      setSelectedFlexibleFile(null);
      setResultType("error");
      setResultMessage(error);
      return;
    }

    setSelectedFlexibleFile(file);
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
    if (!file) return;

    resetFlexibleImportState();

    try {
      const parsedRows = await parseFlexibleFileToRows(file);
      if (parsedRows.length === 0) {
        setResultType("error");
        setResultMessage("No data rows found in the uploaded flexible file.");
        return;
      }

      setFlexibleRows(parsedRows);
      setFlexibleCurrentPage(1);
      setShowFlexibleConfirmPanel(true);
      setResultType("idle");
    } catch {
      setResultType("error");
      setResultMessage("Unable to read the flexible file. Please try again.");
    }
  };

  const validateFlexibleRows = () => {
    const { errors, issues: validationIssues } = validateFlexibleRowsLocal(
      flexibleRows
    );
    setFlexibleValidationErrors(errors);
    setIssues(validationIssues);
    setResultType(validationIssues.length > 0 ? "error" : "success");
    setResultMessage(
      validationIssues.length > 0
        ? "Flexible import has validation issues."
        : "Flexible import validated locally."
    );
    setShowFlexibleConfirmPanel(true);
  };

  const confirmFlexibleImport = async () => {
    setResultType("success");
    setResultMessage(
      "Flexible import is reviewed locally. No backend request was sent."
    );
    setShowFlexibleConfirmPanel(false);
    setSelectedFlexibleFile(null);
    if (onImportComplete) {
      onImportComplete();
    }
  };

  const updateFlexibleCell = (
    rowId: string,
    field: keyof FlexibleEditableRow,
    value: string
  ) => {
    if (field === "id") return;

    setFlexibleRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
    
    // Reset validation state when cells are modified
    setFlexibleValidationErrors({});
    setIssues([]);
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
          disabled={!selectedFlexibleFile}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={openFlexibleEditModal}
          disabled={!selectedFlexibleFile}
          className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start Upload
        </button>
      </div>

      {resultType !== "idle" && (
        <div
          className={[
            "mt-4 rounded-xl border p-4",
            resultType === "success"
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
          ].join(" ")}
        >
          <h3
            className={[
              "text-sm font-semibold",
              resultType === "success"
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200",
            ].join(" ")}
          >
            Upload Status
          </h3>
          <p
            className={[
              "mt-1 text-sm",
              resultType === "success"
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300",
            ].join(" ")}
          >
            {resultMessage}
          </p>
        </div>
      )}

      {showFlexibleConfirmPanel && (
        <FlexibleEditModal
          rows={flexibleRows}
          flexiblePageMeta={flexiblePageMeta}
          flexibleTotalPages={flexibleTotalPages}
          flexibleCurrentPage={flexibleCurrentPage}
          onPageChange={setFlexibleCurrentPage}
          validationErrors={flexibleValidationErrors}
          onUpdateCell={updateFlexibleCell}
          onValidate={validateFlexibleRows}
          onConfirm={confirmFlexibleImport}
          onClose={() => setShowFlexibleConfirmPanel(false)}
          issues={issues}
          selectedFileName={selectedFlexibleFile?.name ?? ""}
          rowCount={flexibleRows.length}
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
  onUpdateCell: (
    rowId: string,
    field: keyof FlexibleEditableRow,
    value: string
  ) => void;
  onValidate: () => void;
  onConfirm: () => void;
  onClose: () => void;
  issues: ValidationIssue[];
  selectedFileName: string;
  rowCount: number;
}

function FlexibleEditModal({
  rows,
  flexiblePageMeta,
  flexibleTotalPages,
  flexibleCurrentPage,
  onPageChange,
  validationErrors,
  onUpdateCell,
  onValidate,
  onConfirm,
  onClose,
  issues,
  selectedFileName,
  rowCount,
}: FlexibleEditModalProps) {
  const paginatedRows = rows.slice(
    (flexibleCurrentPage - 1) * pageSize,
    flexibleCurrentPage * pageSize
  );

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[92vw] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Review and Edit Flexible Data
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This UI is separated. Only the Fixed Import has a backend contract.
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
          <div className="mb-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Mode: Flexible Import | File: {selectedFileName} | Rows: {rowCount}
          </div>

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
            {issues.length > 0
              ? "Flexible import has validation issues."
              : "Flexible import validated locally."}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onValidate}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Validate
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
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
