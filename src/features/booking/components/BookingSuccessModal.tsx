import React from 'react';
import { CheckCircle2, Calendar, Clock, ArrowRight, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Chỉ nhận những thứ tối thiểu cần thiết
  bookingId?: string;
  warningMessage?: string;
  roomName: string;
  date: string;
  timeSlot: string; // "07:00 - 09:00"
  onViewMyBookings: () => void;
  onCreateAnother: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  warningMessage,
  roomName,
  date,
  timeSlot,
  onViewMyBookings,
  onCreateAnother,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop blur */}
      <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      <div className="fixed inset-0 z-[2010] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200">

          {/* Header Success - Dùng màu xanh lá chuyên nghiệp */}
          <div className="bg-emerald-500 p-8 text-center relative overflow-hidden">
            {/* Vẽ vài vòng tròn decor cho xịn */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />

            <div className="relative flex justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl rotate-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 -rotate-3" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Thành công!</h2>
            <p className="text-emerald-50 text-[11px] font-bold uppercase tracking-widest mt-1 opacity-80">
              Yêu cầu đã được gửi duyệt
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Hiển thị Warning Message từ Backend (Peak Occupancy Warning) */}
            {warningMessage && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-orange-100 p-2 rounded-xl h-fit">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-tight">Lưu ý về sức chứa</p>
                  <p className="text-[11px] text-orange-900 font-semibold leading-snug mt-0.5">
                    {warningMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Warning nhẹ về việc chờ duyệt */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5 animate-pulse" />
              <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                <strong>Đang chờ duyệt:</strong> Quản lý phòng Lab sẽ xem xét yêu cầu của bạn trong thời gian sớm nhất.
              </p>
            </div>

            {/* Info tóm tắt - Grid cho gọn */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Phòng & Ngày</p>
                  <p className="text-xs font-black text-gray-800">{roomName} • {formatDate(new Date(date), 'DD/MM/YYYY')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Khung giờ</p>
                  <p className="text-xs font-black text-gray-800">{timeSlot}</p>
                </div>
              </div>
            </div>


          </div>

          {/* Action Buttons - Layout dọc cho Mobile-friendly */}
          <div className="p-6 pt-0 space-y-2">
            <Button
              variant="primary"
              fullWidth
              onClick={onCreateAnother}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl py-3 text-xs font-black uppercase tracking-widest gap-2"
            >
              <Plus className="w-4 h-4" /> Đặt lịch khác
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={onViewMyBookings}
              className="border-gray-200 text-gray-500 rounded-xl py-3 text-xs font-black uppercase tracking-widest gap-2"
            >
              Xem lịch của tôi <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};