import { Download, QrCode, RefreshCw, UserCheck } from 'lucide-react';
import type { BookingWithQR } from '../types/attendance.type';

interface AttendanceActiveSessionPanelProps {
  session: null; // Session parameter removed in new API
  actionBooking: BookingWithQR | null;
  activeDisplayRoom: string;
  activeDisplayBuilding: string;
  isExpired: boolean;
  isCreatingQr: boolean;
  onManualAttendance: () => void;
  onViewQR: () => void;
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
}

export function AttendanceActiveSessionPanel({
  session: _, // Removed in new API
  actionBooking,
  activeDisplayRoom,
  activeDisplayBuilding,
  isExpired,
  isCreatingQr,
  onManualAttendance,
  onViewQR,
  onExport: _onExport, // Unused
}: AttendanceActiveSessionPanelProps) {
  if (!actionBooking) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-slate-200 rounded-2xl p-6 mb-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">Active Class</h2>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-300">
                LIVE
              </span>
            </div>
            <p className="text-slate-600 font-medium">
              {activeDisplayRoom} • {activeDisplayBuilding}
            </p>
          </div>
        </div>

        {isExpired && (
          <div className="bg-red-100 border-2 border-red-300 rounded-xl px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-700">Expired</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onManualAttendance}
          disabled={!actionBooking}
          className="bg-indigo-50 border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          <UserCheck className="w-5 h-5" />
          <span>Manual Attendance</span>
        </button>

        <button
          onClick={onViewQR}
          disabled={isCreatingQr}
          className="bg-slate-50 border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          {isCreatingQr ? <RefreshCw className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
          <span>{isCreatingQr ? 'Creating QR...' : 'View QR'}</span>
        </button>
      </div>

      <div className="relative group mt-3">
        <button className="w-full bg-slate-50 border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          <span>Export Attendance</span>
        </button>

        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <button
            onClick={() => _onExport('csv')}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-t-xl text-slate-700 font-medium text-sm transition-colors"
          >
            Export as CSV
          </button>
          <button
            onClick={() => _onExport('excel')}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
          >
            Export as Excel
          </button>
          <button
            onClick={() => _onExport('pdf')}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-b-xl text-slate-700 font-medium text-sm transition-colors"
          >
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
