import { Building2, Calendar, Clock, ExternalLink, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BookingWithQR } from '../../attendance/types/attendance.type';
import { formatBookingTimeLabel, formatUtcDateLabel, isBookingUpcoming, convertHoursUtcToVN } from '../../../utils/date.util';

interface AttendanceBookingCardProps {
  booking: BookingWithQR;
}

export function AttendanceBookingCard({ booking }: AttendanceBookingCardProps) {
  const navigate = useNavigate();

  const statusColors: Record<BookingWithQR['status'], string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    NotYet: 'bg-amber-50 text-amber-700 border-amber-200',
    Done: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-slate-700" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 truncate">{booking.roomName}</h3>
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColors[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-sm text-slate-600">{booking.roomCode}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{booking.buildingName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{formatUtcDateLabel(booking.startTime || booking.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm tabular-nums">
                {convertHoursUtcToVN(formatBookingTimeLabel(booking.date, booking.startTime))} - {convertHoursUtcToVN(formatBookingTimeLabel(booking.date, booking.endTime))}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-700 line-clamp-1">
            <span className="font-semibold">Purpose:</span> {booking.purpose}
          </p>
        </div>

        <div className="flex-shrink-0">
          {booking.hasQRSession ? (
            <button
              onClick={() => navigate(`/qr-display/${booking.qrSessionId}`)}
              className="bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Session</span>
            </button>
          ) : isBookingUpcoming(booking) && booking.status === 'Active' ? (
            <button
              disabled
              className="bg-slate-100 text-slate-500 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed border border-slate-200 whitespace-nowrap flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Available at class start</span>
            </button>
          ) : (
            <button
              disabled
              className="bg-slate-100 text-slate-400 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed border border-slate-200 whitespace-nowrap"
            >
              Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
