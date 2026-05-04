import { useMemo, useState } from "react";
import FixedImportPanel from "./FixedImportPanel";
import FlexibleImportPanel from "./FlexibleImportPanel";
import { getDynamicSemesters, getSemesterDetails } from "../../../utils/semester.util";
import { formatDate } from "date-fns";
import type { ImportBatchDto } from "../../schedules/types/import-batch.type";
import { useImportBatches } from "../../schedules/hooks/useImportBatches";
import { ImportBatchList } from "../../schedules/components/ImportBatchList";
import { RefreshCw } from "lucide-react";

export default function ImportBookingFeature() {
  // Tự động suy ra danh sách kỳ dựa trên thời gian thực (ví dụ: tháng 4/2026)
  const availableSemesters = useMemo(() => getDynamicSemesters(), []);

  // Mặc định chọn kỳ đầu tiên (thường là kỳ hiện tại)
  const [selectedCode, setSelectedCode] = useState(availableSemesters[0]);
  const [editingBatch, setEditingBatch] = useState<ImportBatchDto | null>(null);

  // Gọi Hook lấy danh sách Batch theo học kỳ đang chọn
  const { batchesQuery, deleteMutation } = useImportBatches(selectedCode);

  const semesterDetails = useMemo(() =>
    getSemesterDetails(selectedCode),
    [selectedCode]
  );

  const handleReimport = (batch: ImportBatchDto) => {
    setEditingBatch(batch);
    // Cuộn lên đầu trang để người dùng thấy Panel Upload
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImportComplete = () => {
    batchesQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Import Schedules from Excel
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Upload files that match the BE contract. Two import modes are available: Fixed
            and Flexible.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Chọn kỳ Import</label>
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="rounded-lg border border-gray-300 p-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {availableSemesters.map((code) => (
              <option key={code} value={code}>
                {getSemesterDetails(code).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hiển thị chi tiết ngày để user kiểm tra trước khi Import */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-8">
        <div>
          <p className="text-[10px] uppercase text-blue-500 font-bold">Ngày bắt đầu</p>
          <p className="text-lg font-bold text-blue-900">{formatDate(semesterDetails.startDate, "dd-MM-yyyy")}</p>
        </div>
        <div className="flex items-center text-blue-300">→</div>
        <div>
          <p className="text-[10px] uppercase text-blue-500 font-bold">Ngày kết thúc</p>
          <p className="text-lg font-bold text-blue-900">{formatDate(semesterDetails.endDate, "dd-MM-yyyy")}</p>
        </div>
      </div>

      {/* Thông báo nếu đang ở chế độ Re-import */}
      {editingBatch && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-left-4">
          <div className="flex items-center gap-3 text-amber-800 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
            <span>Đang ở chế độ <b>Cập nhật đợt Import: {editingBatch.name}</b>. File tải lên sẽ ghi đè đợt này.</span>
          </div>
          <button
            onClick={() => setEditingBatch(null)}
            className="text-xs font-bold text-amber-900 underline"
          >
            Hủy và tạo đợt mới
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <FixedImportPanel semester={semesterDetails} onImportComplete={handleImportComplete} editingBatchId={editingBatch?.id || null} />
        <FlexibleImportPanel semester={semesterDetails} onImportComplete={handleImportComplete} editingBatchId={editingBatch?.id || null} />
      </div>

      {/* Danh sách Batch hiển thị bên dưới */}
      <ImportBatchList
        batches={batchesQuery.data || []}
        onDelete={(id) => deleteMutation.mutate(id)}
        onReimport={handleReimport}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
