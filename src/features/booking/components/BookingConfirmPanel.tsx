import React, { useState } from 'react';
import { X, Users, MessageSquare, ClipboardCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';
import type { PurposeTypeDto } from '../types/booking.type';

interface BookingConfirmPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  startTime: string;
  endTime: string;
  roomName: string;
  onConfirm: (data: {
    reason: string;
    studentCount: number;
    isRecurring: boolean;
    weeks: number;
    purposeId: number;
  }) => void;
  loading?: boolean;
  purposes: PurposeTypeDto[];
  purposesLoading: boolean;
}

export const BookingConfirmPanel: React.FC<BookingConfirmPanelProps> = ({
  isOpen,
  onClose,
  selectedDate,
  startTime,
  endTime,
  roomName,
  onConfirm,
  loading = false,
  purposes,
  purposesLoading,

}) => {
  const [reason, setReason] = useState('');
  const [studentCount, setStudentCount] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);
  const [weeks, setWeeks] = useState(1);
  const [purposeId, setPurposeId] = useState<number>(purposes[0]?.id || 1);
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1000] animate-in fade-in duration-300" onClick={onClose} />
      <div className="fixed inset-0 z-[1010] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between bg-orange-50/50">
            <h2 className="text-lg font-black text-gray-900 uppercase">Xác nhận đặt phòng</h2>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X className="h-5 w-5 text-gray-400" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Tóm tắt */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Phòng</span>
                <span className="font-black text-orange-600">{roomName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Thời gian</span>
                <span className="font-bold text-gray-900">{formatDate(new Date(selectedDate), 'DD/MM/YYYY')} | {startTime}-{endTime}</span>
              </div>
            </div>

            {/* Input số lượng */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2">
                <Users className="w-3.5 h-3.5" /> Số lượng người dự kiến
              </label>
              <input
                type="number" min="1"
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 font-bold focus:border-orange-400 outline-none transition-all"
              />
            </div>

            {/* Input lý do */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2">
                <MessageSquare className="w-3.5 h-3.5" /> Lý do sử dụng
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do cụ thể..."
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 text-sm focus:border-orange-400 outline-none transition-all resize-none"
              />
            </div>

            {/* Toggle lặp lại */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4 accent-orange-600" />
                <span className="text-sm font-bold text-gray-700 uppercase text-[11px]">Đặt lịch lặp lại hàng tuần</span>
              </label>
              {isRecurring && (
                <div className="mt-3 pl-7 space-y-2 animate-in slide-in-from-top-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                    <span>Số tuần: {weeks}</span>
                  </div>
                  <input type="range" min="1" max="10" value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="w-full accent-orange-600" />
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2">
                <ClipboardCheck className="w-3.5 h-3.5" /> Mục đích sử dụng
              </label>

              {purposesLoading ? (
                <div className="h-10 bg-gray-100 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={purposeId}
                  onChange={(e) => setPurposeId(Number(e.target.value))}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-orange-400 outline-none appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.75rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.2em"
                  }}
                >
                  {purposes.map((p) => (
                    <option key={p.id} value={p.id}>{p.purposeName}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose} className="rounded-xl font-bold uppercase text-[10px]">Hủy</Button>
            <Button
              variant="primary" fullWidth
              onClick={() => onConfirm({ reason, studentCount, isRecurring, weeks, purposeId })}
              isLoading={loading}
              disabled={!reason.trim()}
              className="rounded-xl font-bold uppercase text-[10px] bg-orange-600"
            >
              Xác nhận đặt
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};