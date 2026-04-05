import { useRef, useState, useMemo } from "react";
import type { EditableUserRow, ValidationIssue, ValidationErrors } from "../types/importUser.type";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
} from "../constants/importUser";
import {
  parseFileToRows,
  createEmptyRows,
  toUserImportRows,
  validateRows,
  resolveFieldFromText,
  pushRowIssue,
} from "../utils/importUserUtils";
import type { ValidateUserImportRequest, CommitUserImportRequest } from "../types/importUser.type";
import { useUserImport } from "../hooks/useUserImport";
import { useToast } from "../../../hooks/useToast";
import EditModal from "./EditModal";

interface ImportUserPanelProps {
  onImportComplete?: () => void;
}

const pageSize = 10;

export default function ImportUserPanel({ onImportComplete }: ImportUserPanelProps) {
  const {
    validateUserRows,
    commitUserRows,
    validateUserImportMutation,
    commitUserImportMutation,
  } = useUserImport();
  const toast = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string>("");
  const [hasValidated, setHasValidated] = useState(false);
  const [canCommit, setCanCommit] = useState(false);
  const [rows, setRows] = useState<EditableUserRow[]>(createEmptyRows(6));
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [modifiedCells, setModifiedCells] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmPanel, setShowConfirmPanel] = useState(false);

  const isValidating = validateUserImportMutation.isPending;
  const isUploading = commitUserImportMutation.isPending;

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

  const updateCell = (rowId: string, field: keyof EditableUserRow, value: string) => {
    if (field === "id") return;

    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );

    // Track modified cell
    const errorKey = `${rowId}:${String(field)}`;
    setModifiedCells((prev) => ({ ...prev, [errorKey]: true }));

    // Reset validation state when cells are modified
    setCanCommit(false);
    setHasValidated(false);
    setValidationErrors({});
    setIssues([]);
  };

  const validateRowsData = async () => {
    const { errors: clientErrors, issues: clientIssues } = validateRows(rows);
    const nextErrors = { ...clientErrors };
    const nextIssues = [...clientIssues];

    setModalError("");

    try {
      const payload: ValidateUserImportRequest = {
        Users: toUserImportRows(rows),
      };

      const response = await validateUserRows(payload);

      // Handle both PascalCase and camelCase response from backend
      const rowsData = (response.Rows ?? (response as any).rows) ?? [];

      rowsData.forEach((rowResult: any) => {
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
        setModalError("");
      } else {
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
      const payload: CommitUserImportRequest = {
        Users: toUserImportRows(rows),
      };

      const response = await commitUserRows(payload);

      // Handle both PascalCase and camelCase response from backend
      const isSuccess = (response as any).Success ?? (response as any).success;
      const message = (response as any).Message ?? (response as any).message;

      if (isSuccess) {
        toast.success("Import thành công!", "Dữ liệu người dùng đã được nhập vào hệ thống.");
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
            Import Users
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Columns: FullName, Email, UserCode, CampusId, RoleName.
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
          Drag and drop user import file here
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
          onValidate={validateRowsData}
          onConfirm={() => setShowConfirmPanel(true)}
          onClose={closeEditModal}
          onConfirmImport={confirmImport}
          onCancelConfirm={closeConfirmPanel}
          showConfirmPanel={showConfirmPanel}
          issues={issues}
          selectedFileName={selectedFile?.name || ""}
          rowCount={rows.length}
          modalError={modalError}
        />
      )}
    </div>
  );
}
