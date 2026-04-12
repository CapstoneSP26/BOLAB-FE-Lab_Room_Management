import { useState } from "react";
import { AlertCircle, X } from "lucide-react";

interface Props {
  rejectId: string | null
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, reason: string) => void;
  isLoading?: boolean;
}

export default function RejectReasonModal({
  rejectId,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: Props) {
  const [reason, setReason] = useState("");
  if (!isOpen) return null;

  const handleReject = (id: string | null, reason: string) => {
    if (id == null) return;
    onSubmit(id, reason);
  }

  return (
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !isLoading && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Reject Request
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please provide a reason for rejecting this booking request. This will be sent to the requester.
          </p>

          <textarea
            autoFocus
            className="w-full min-h-[120px] rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-900 outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-red-500/50"
            placeholder="Enter reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
          />
        </div>

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
            onClick={() => handleReject(rejectId, reason)}
            disabled={isLoading || !reason.trim()}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-red-600"
          >
            {isLoading ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
