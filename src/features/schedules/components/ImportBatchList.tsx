import { Trash2, RefreshCw, Layers } from "lucide-react";
import { format } from "date-fns";
import type { ImportBatchDto } from "../types/import-batch.type";

interface ImportBatchListProps {
  batches: ImportBatchDto[];
  onDelete: (id: string) => void;
  onReimport: (batch: ImportBatchDto) => void;
  isDeleting: boolean;
}

export const ImportBatchList = ({ batches, onDelete, onReimport, isDeleting }: ImportBatchListProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-500" />
          Lịch sử Import trong học kỳ
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3">Tên đợt (Batch Name)</th>
              <th className="px-6 py-3">Loại</th>
              <th className="px-6 py-3">Ngày tạo</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {batches.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400">Chưa có đợt import nào</td>
              </tr>
            ) : (
              batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{batch.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${batch.importBatchType === 1 ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {batch.importBatchType === 1 ? 'FIXED' : 'FLEXIBLE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(batch.createdAt), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onReimport(batch)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Re-import (Cập nhật đợt này)"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm("Xóa đợt import này sẽ xóa toàn bộ lịch liên quan?")) onDelete(batch.id) }}
                      disabled={isDeleting}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Xóa đợt này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};