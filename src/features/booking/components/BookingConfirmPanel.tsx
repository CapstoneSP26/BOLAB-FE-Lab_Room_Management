import React, { useState } from 'react';
import { X, Users, MessageSquare, ClipboardCheck, Repeat2 } from 'lucide-react';
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
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200">

          {/* Modern Header */}
          <div className="px-6 py-6 bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Xác nhận đặt phòng</h2>
              <p className="text-xs text-orange-100 mt-0.5">Vui lòng kiểm tra thông tin</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Summary Info Card */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📍 Phòng</span>
                  <span className="text-lg font-bold text-orange-600">{roomName}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">🕐 Thời gian</span>
                  <div className="text-right">
                    <span className="block text-sm font-semibold text-slate-900">{formatDate(new Date(selectedDate), 'DD/MM/YYYY')}</span>
                    <span className="text-xs text-orange-600 font-bold">{startTime} → {endTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Number Input */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
                  <Users className="w-4 h-4 text-orange-500" />
                  Số lượng người
                </label>
                <input
                  type="number"
                  min="1"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium text-sm bg-white hover:border-slate-400"
                />
              </div>

              {/* Textarea */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  Lý do sử dụng
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Mô tả chi tiết..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium text-sm bg-white hover:border-slate-400 placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Select */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
                  <ClipboardCheck className="w-4 h-4 text-orange-500" />
                  Mục đích sử dụng
                </label>
                {purposesLoading ? (
                  <div className="h-11 bg-slate-100 animate-pulse rounded-lg" />
                ) : (
                  <select
                    value={purposeId}
                    onChange={(e) => setPurposeId(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium text-sm bg-white hover:border-slate-400 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ea580c' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.2em",
                      paddingRight: "2.5rem"
                    }}
                  >
                    {purposes.map((p) => (
                      <option key={p.id} value={p.id}>{p.purposeName}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Recurring */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer select-none group p-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <Repeat2 className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-slate-900">Lặp lại hàng tuần</span>
                  </div>
                </label>

                {isRecurring && (
                  <div className="mt-3 p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-200 shadow-sm animate-in slide-in-from-top-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Số tuần</span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">{weeks}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={weeks}
                        onChange={(e) => setWeeks(Number(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${(weeks / 10) * 100}%, #e2e8f0 ${(weeks / 10) * 100}%, #e2e8f0 100%)`
                        }}
                        className="w-full h-2.5 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-slate-500 font-medium mt-2">
                        <span>1 tuần</span>
                        <span>10 tuần</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modern Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
            <Button 
              variant="outline" 
              fullWidth 
              onClick={onClose} 
              className="rounded-lg font-bold uppercase text-xs hover:bg-slate-200 border-slate-300" 
              size="md"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => onConfirm({ reason, studentCount, isRecurring, weeks, purposeId })}
              isLoading={loading}
              disabled={!reason.trim()}
              className="rounded-lg font-bold uppercase text-xs bg-orange-600 hover:bg-orange-700 shadow-md"
              size="md"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};