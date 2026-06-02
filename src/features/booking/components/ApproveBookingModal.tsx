import { CheckCircle2, X } from "lucide-react";

interface Props {
  approveId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string) => void;
  isLoading?: boolean;
}

export default function ApproveBookingModal({
  approveId,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: Props) {
  if (!isOpen) return null;

  const handleApprove = () => {
    if (approveId == null) return;
    onSubmit(approveId);
  };

  return (
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !isLoading && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Chuẩn tone màu xanh lá thành công (Emerald) */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Approve Booking Request
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Sửa text ngắn gọn, tập trung vào xác nhận */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Are you sure you want to approve this booking request? Once approved, the lab room schedule will be updated immediately.
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Approving...</span>
              </div>
            ) : (
              "Confirm Approval"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}