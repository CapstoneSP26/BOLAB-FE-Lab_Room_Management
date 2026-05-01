import { useRef, useState, useMemo } from "react";
import type { EditableLabRoomRow, ValidationErrors } from "../types/importLabRoom.type";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
} from "../constants/importLabRoom";
import {
  parseLabRoomFileToRows,
  createEmptyLabRoomRows,
  getLabRoomErrorKey,
  toLabRoomImportRows,
} from "../utils/importLabRoomUtils";
import type { ValidateLabRoomImportRequest, CommitLabRoomImportRequest } from "../types/importLabRoom.type";
import { useLabRoomImport } from "../hooks/useLabRoomImport";
import { useToast } from "../../../hooks/useToast";

interface ImportLabRoomPanelProps {
  onImportComplete?: () => void;
}

const pageSize = 10;

export default function ImportLabRoomPanel({ onImportComplete }: ImportLabRoomPanelProps) {
  const {
    validateLabRoomRows,
    commitLabRoomRows,
    validateLabRoomImportMutation,
    commitLabRoomImportMutation,
  } = useLabRoomImport();
  const toast = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string>("");
  const [hasValidated, setHasValidated] = useState(false);
  const [canCommit, setCanCommit] = useState(false);
  const [rows, setRows] = useState<EditableLabRoomRow[]>(createEmptyLabRoomRows(6));
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [modifiedCells, setModifiedCells] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmPanel, setShowConfirmPanel] = useState(false);

  const isValidating = validateLabRoomImportMutation.isPending;
  const isUploading = commitLabRoomImportMutation.isPending;

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
    setCanCommit(false);
    setHasValidated(false);
    setValidationErrors({});
    setModifiedCells({});
    setModalError("");
    setShowConfirmPanel(false);
    setRows(createEmptyLabRoomRows(6));
    setCurrentPage(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelection = (file: File | null) => {
    setModalError("");

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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFile(file);
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
      const parsedRows = await parseLabRoomFileToRows(file);
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

  const updateCell = (rowId: string, field: keyof EditableLabRoomRow, value: string) => {
    if (field === "id") return;

    const key = getLabRoomErrorKey(rowId, field);

    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );

    setModifiedCells((prev) => ({ ...prev, [key]: true }));

    // Reset validation state when cells are modified
    setCanCommit(false);
    setHasValidated(false);
    setValidationErrors({});
  };

  const validateRows = async () => {
    setModalError("");

    try {
      const payload: ValidateLabRoomImportRequest = {
        LabRooms: toLabRoomImportRows(rows),
      };

      const response = await validateLabRoomRows(payload);

      setCanCommit(response.CanCommit ?? (response as any).canCommit);
      setHasValidated(true);

      const canCommitValue = response.CanCommit ?? (response as any).canCommit;
      const nextErrors: ValidationErrors = {};

      // Process backend errors
      const rowsData = (response.Rows ?? (response as any).rows) ?? [];
      rowsData.forEach((rowResult: any) => {
        const rowNum = rowResult.RowNumber ?? rowResult.rowNumber ?? 0;
        const errorsData = rowResult.Errors ?? rowResult.errors ?? [];

        errorsData.forEach((error: any) => {
          const fieldName = error.FieldName ?? error.fieldName ?? "Unknown";
          const message = error.Message ?? error.message ?? "Unknown error";
          const key = getLabRoomErrorKey(`row-${rowNum}`, fieldName as any);
          nextErrors[key] = message;
        });
      });

      setValidationErrors(nextErrors);

      if (!canCommitValue) {
        setModalError("Validation found critical issues. Please fix rows before import.");
      }
    } catch {
      setCanCommit(false);
      setValidationErrors({});
      setHasValidated(true);
      setModalError("Unable to validate import data. Please try again.");
    }
  };

  const confirmImport = async () => {
    if (!selectedFile || isUploading || !hasValidated || !canCommit) return;

    try {
      const payload: CommitLabRoomImportRequest = {
        LabRooms: toLabRoomImportRows(rows),
      };

      const response = await commitLabRoomRows(payload);

      const isSuccess = (response as any).Success ?? (response as any).success;
      const message = (response as any).Message ?? (response as any).message;

      if (isSuccess) {
        toast.success("Import thành công!", "Dữ liệu LabRoom đã được nhập vào hệ thống.");
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
    } catch {
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
            Import Lab Rooms
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Columns: BuildingId, RoomName, RoomNo, Location, Capacity, HasEquipment, OverrideNumber, Description.
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
          Drag and drop labroom import file here
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

      {modalError && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-xs font-semibold text-red-800 dark:text-red-200">
            Error
          </p>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
            {modalError}
          </p>
        </div>
      )}

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
        <LabRoomImportModal
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
          selectedFileName={selectedFile?.name ?? ""}
          rowCount={rows.length}
          modalError={modalError}
        />
      )}
    </div>
  );
}

interface LabRoomImportModalProps {
  rows: EditableLabRoomRow[];
  pageMeta: { start: number; end: number };
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  validationErrors: any;
  modifiedCells: Record<string, boolean>;
  hasValidated: boolean;
  canCommit: boolean;
  isValidating: boolean;
  isUploading: boolean;
  onUpdateCell: (rowId: string, field: keyof EditableLabRoomRow, value: string) => void;
  onValidate: () => void;
  onConfirm: () => void;
  onClose: () => void;
  onConfirmImport: () => void;
  onCancelConfirm: () => void;
  showConfirmPanel: boolean;
  selectedFileName: string;
  rowCount: number;
  modalError: string;
}

function LabRoomImportModal({
  rows,
  totalPages,
  currentPage,
  onPageChange,
  validationErrors,
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
  selectedFileName,
  rowCount,
  modalError,
}: LabRoomImportModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative z-10 w-[92vw] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900">
          <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Review and Edit Lab Room Data
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
              Mode: LabRoom Import | File: {selectedFileName} | Rows: {rowCount}
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

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <th className="border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      ID
                    </th>
                    <th className="border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      BuildingCode
                    </th>
                    <th className="border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      RoomName
                    </th>
                    <th className="border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      RoomNo
                    </th>
                    <th className="border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      Location
                    </th>
                    <th className="border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      Capacity
                    </th>
                    <th className="border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      HasEquipment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <td className="border-r border-gray-200 px-3 py-2 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        {row.id}
                      </td>
                      {(["BuildingCode", "RoomName", "RoomNo", "Location", "Capacity", "HasEquipment"] as const).map(
                        (field) => (
                          <td
                            key={field}
                            className={`border-r border-gray-200 px-3 py-2 dark:border-gray-700`}
                          >
                            <input
                              type="text"
                              value={row[field]}
                              onChange={(e) =>
                                onUpdateCell(row.id, field, e.target.value)
                              }
                              className={`w-full rounded px-2 py-1 text-xs font-medium border ${validationErrors[`${row.id}-${field}`]
                                ? "border-red-400 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200"
                                : "border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                }`}
                            />
                            {validationErrors[`${row.id}-${field}`] && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                {validationErrors[`${row.id}-${field}`]}
                              </p>
                            )}
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Page {currentPage}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                Next
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              {hasValidated
                ? canCommit
                  ? "✓ Validation passed."
                  : "✗ Validation found issues."
                : "Click Validate before confirming."}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onValidate}
                disabled={isValidating || isUploading || rowCount === 0}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
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

          {showConfirmPanel && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Confirm Import
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Are you sure you want to import {rowCount} lab room(s)?
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onConfirmImport}
                  disabled={isUploading}
                  className="rounded-lg bg-green-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? "Importing..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={onCancelConfirm}
                  disabled={isUploading}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
