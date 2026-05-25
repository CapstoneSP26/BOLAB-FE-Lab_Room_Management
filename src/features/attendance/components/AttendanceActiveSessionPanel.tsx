import { Camera, Download, QrCode, RefreshCw, UserCheck } from 'lucide-react';
import type { BookingWithQR } from '../types/attendance.type';

interface AttendanceActiveSessionPanelProps {
  session: null;
  actionBooking: BookingWithQR | null;
  activeDisplayRoom: string;
  activeDisplayBuilding: string;
  isExpired: boolean;
  isCreatingQr: boolean;
  isOthersCheckinOpen: boolean;
  onManualAttendance: () => void;
  onOpenOthersCheckin: () => void;
  onOpenFaceScan: () => void;
  onViewQR: () => void;
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
}

export function AttendanceActiveSessionPanel({
  session: _,
  actionBooking,
  activeDisplayRoom,
  activeDisplayBuilding,
  isExpired,
  isCreatingQr,
  isOthersCheckinOpen,
  onManualAttendance,
  onOpenOthersCheckin,
  onOpenFaceScan,
  onViewQR,
  onExport: _onExport,
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
            <p className="text-slate-600 font-medium">{activeDisplayRoom} • {activeDisplayBuilding}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={onManualAttendance}
          disabled={!actionBooking}
          className="bg-indigo-50 border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          <UserCheck className="w-5 h-5" />
          <span>Manual Attendance</span>
        </button>

        <button
          onClick={onOpenOthersCheckin}
          disabled={isOthersCheckinOpen}
          className="bg-slate-50 border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          <span>{isOthersCheckinOpen ? 'Others Checkin Open' : 'Others Checkin'}</span>
        </button>
      </div>

      <div className="relative group mt-3">
        <button className="w-full bg-slate-50 border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          <span>Export Attendance</span>
        </button>

        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <button onClick={() => _onExport('csv')} className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-t-xl text-slate-700 font-medium text-sm transition-colors">Export as CSV</button>
          <button onClick={() => _onExport('excel')} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors">Export as Excel</button>
          <button onClick={() => _onExport('pdf')} className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-b-xl text-slate-700 font-medium text-sm transition-colors">Export as PDF</button>
        </div>
      </div>

      {isOthersCheckinOpen && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Other check-in methods</p>
              <p className="text-xs text-slate-500">Choose QR or FaceScan only when needed.</p>
            </div>
            <button
              onClick={onOpenOthersCheckin}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              onClick={onViewQR}
              disabled={isCreatingQr}
              className="bg-blue-50 border border-blue-200 hover:border-blue-400 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isCreatingQr ? <RefreshCw className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
              <span>{isCreatingQr ? 'Creating QR...' : 'QR Check-in'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenFaceScan}
              className="bg-emerald-50 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 text-emerald-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span>FaceScan Check-in</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
