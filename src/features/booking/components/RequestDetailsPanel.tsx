import { CheckCircle2, PencilLine, X, XCircle, Info, MapPin, Users, CalendarDays, Clock, FileText, AlertTriangle } from "lucide-react";
import type { BookingRequest } from "../types/booking.type";
import { convertHoursUtcToVN, formatUtcDateLabel } from "../../../utils/date.util";

type Props = {
  booking: BookingRequest | null;
  isLocked?: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSuggestAlternate: (id: string) => void;
};

function getPriorityColor(purpose: string) {
  const p = purpose.toUpperCase();
  if (p.includes("WORKSHOP")) return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
  if (p.includes("PRACTICAL")) return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  if (p.includes("LECTURE")) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
}

export default function RequestDetailsPanel({
  booking,
  isLocked,
  onClose,
  onApprove,
  onReject,
  onSuggestAlternate,
}: Props) {
  if (!booking) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50/50 p-8 text-center dark:border-gray-800 dark:bg-gray-900/20">
        <Info className="mb-3 h-8 w-8 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No request selected</h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Select a booking from the timeline to inspect its details.
        </p>
      </div>
    );
  }

  const priorityColor = getPriorityColor(booking.purpose ?? "");

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 xl:sticky xl:top-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/80">
        <div className="flex items-center gap-2.5">
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityColor}`}>
            {booking.purpose || "Booking"}
          </span>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {booking.status}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Requester Info */}
        <div className="mb-5 flex items-center gap-3">
          {booking.requester?.avatarUrl ? (
            <img src={booking.requester.avatarUrl} alt="Avatar" className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-bold">
              {booking.requester?.fullName?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {booking.requester?.fullName || booking.requestedBy || "Unknown User"}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {booking.requester?.email || "No email provided"}
            </p>
          </div>
        </div>

        {/* 2-Column Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              <CalendarDays className="h-3.5 w-3.5" /> Date
            </div>
            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {formatUtcDateLabel(booking.date)}
            </div>
          </div>
          
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              <Clock className="h-3.5 w-3.5" /> Time
            </div>
            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {convertHoursUtcToVN(booking.startTime)} - {convertHoursUtcToVN(booking.endTime)}
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              <MapPin className="h-3.5 w-3.5" /> Room
            </div>
            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {booking.roomName} ({booking.buildingName})
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              <Users className="h-3.5 w-3.5" /> Students
            </div>
            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {booking.studentCount ?? "N/A"}
            </div>
          </div>
        </div>

        {/* Notes / Reason */}
        <div className="mb-5 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/30">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <FileText className="h-3.5 w-3.5" /> Notes
          </div>
          <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            {booking.reason || "No additional notes provided by the requester."}
          </p>
        </div>

        {/* Conflict Summary */}
        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3 dark:border-rose-900/30 dark:bg-rose-900/10">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-400 mb-1">
            System Analysis
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            No overlaps detected. This slot is clear.
          </p>
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="border-t border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {isLocked && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Action Locked
            </div>
            Please process the higher priority booking in this room first before approving this request.
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => !isLocked && onApprove(String(booking.id))}
            disabled={isLocked}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold shadow-sm transition ${
              isLocked 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500" 
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" /> Approve
          </button>
          
          <button
            type="button"
            onClick={() => onReject(String(booking.id))}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
          >
            <XCircle className="h-4 w-4" /> Reject
          </button>
        </div>
        
        <button
          type="button"
          onClick={() => onSuggestAlternate(String(booking.id))}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <PencilLine className="h-3.5 w-3.5" /> Suggest Alternate
        </button>
      </div>
    </div>
  );
}
