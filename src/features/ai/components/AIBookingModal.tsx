import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Calendar, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAISmartBooking } from '../hooks/useAISmartBooking';
import { useCreateBooking } from '../../booking/hooks/useCreateBooking';
import { useToast } from '../../../hooks/useToast';

interface AIBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIBookingModal: React.FC<AIBookingModalProps> = ({ isOpen, onClose }) => {
  const [userPrompt, setUserPrompt] = useState('');
  const { parseAsync, isParsing, parseData } = useAISmartBooking();
  const { mutate: createBooking, isPending: isCreating } = useCreateBooking();
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) {
      setUserPrompt('');
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!userPrompt.trim() || isParsing) return;
    await parseAsync({ userPrompt });
  };

  // Hàm xử lý chung cho cả primaryBooking và suggestion
  const executeBooking = (data: any) => {
    // Backend trả về rỗng hoặc null cho date thì lấy baseDate
    const datePart = data.date || data.baseDate?.split('T')[0];

    createBooking({
      labRoomId: data.labRoomId,
      purposeTypeId: data.purposeTypeId ?? 1,
      startTime: new Date(`${datePart}T${data.startTime}`).toISOString(), // Backend thường cần ISO
      endTime: new Date(`${datePart}T${data.endTime}`).toISOString(),
      studentCount: data.studentCount,
      recurringCount: data.recurringCount || 1,
      slotTypeId: 0,
      reason: 'AI Smart Booking'
    }, {
      onSuccess: () => {
        onClose();
        toast.success('Đặt phòng thành công!');

      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Đặt phòng thất bại');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl tracking-tight">AI Smart Booking</h3>
              <p className="text-[10px] opacity-90 uppercase font-black tracking-[0.1em]">Beta Version</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nhập yêu cầu</label>
            <div className="relative group">
              <textarea
                className="w-full p-4 pr-14 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all resize-none text-gray-700 shadow-sm"
                placeholder="Ví dụ: Đặt Software Lab chiều mai từ 12:30 đến 17:15..."
                rows={3}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              />
              <button
                onClick={handleSend}
                disabled={isParsing || !userPrompt.trim()}
                className="absolute bottom-3 right-3 p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-30 shadow-lg shadow-orange-200 transition-all active:scale-95"
              >
                {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* AI Response Section */}
          {parseData && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Message Banner */}
              <div className={`p-4 rounded-2xl flex gap-3 shadow-sm ${parseData.status === 'Success' ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
                {parseData.status === 'Success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <div className="text-sm">
                  <p className="font-bold">AI: {parseData.message}</p>
                  {parseData.confidence < 70 && <p className="text-[10px] opacity-70">Độ tin cậy: {parseData.confidence}%</p>}
                </div>
              </div>

              {/* 1. HIỂN THỊ KẾT QUẢ CHÍNH (Nếu có) */}
              {parseData.primaryBooking && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kết quả phân tích</h4>
                  <button
                    disabled={isCreating}
                    onClick={() => executeBooking(parseData.primaryBooking)}
                    className="w-full text-left bg-orange-50/50 border-2 border-orange-200 p-4 rounded-2xl hover:bg-orange-50 transition-all group shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900">{parseData.primaryBooking.roomName || 'Phòng đã chọn'}</span>
                      <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1 font-medium italic">
                        <Calendar className="w-3 h-3" /> {parseData.primaryBooking?.baseDate ? new Date(parseData.primaryBooking.baseDate).toLocaleDateString('vi-VN') : 'Ngày không xác định'}
                      </span>
                      <span className="font-bold text-orange-600">
                        {parseData.primaryBooking?.startTime?.substring(0, 5)} - {parseData.primaryBooking?.endTime?.substring(0, 5)}
                      </span>
                    </div>
                    <div className="mt-3 w-full bg-orange-500 text-white text-center py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-100 group-hover:bg-orange-600">
                      {isCreating ? 'Đang thực hiện...' : 'Xác nhận đặt ngay'}
                    </div>
                  </button>
                </div>
              )}

              {/* 2. HIỂN THỊ GỢI Ý THAY THẾ (Nếu có) */}
              {parseData.suggestions?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gợi ý khác</h4>
                  <div className="grid gap-3">
                    {parseData.suggestions.map((s: any, idx: number) => (
                      <button
                        key={idx}
                        disabled={isCreating}
                        onClick={() => executeBooking(s)}
                        className="w-full text-left bg-white border-2 border-gray-100 p-4 rounded-2xl hover:border-orange-500 transition-all group"
                      >
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-gray-800">{s.title}</span>
                          <span className="text-orange-500 font-black">{s.matchScore}%</span>
                        </div>
                        <p className="text-[11px] text-gray-500 italic mb-2 line-clamp-1">"{s.description}"</p>
                        <div className="flex gap-3 text-[10px] font-bold text-gray-400 uppercase">
                          <span>{new Date(s.date).toLocaleDateString('vi-VN')}</span>
                          <span>{s.startTime} - {s.endTime}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflict Details */}
              {parseData.conflictDetails?.length > 0 && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-600 uppercase mb-2">Lý do trùng lịch:</p>
                  <ul className="text-xs text-red-500 list-disc list-inside space-y-1">
                    {parseData.conflictDetails.map((d: string, i: number) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50/50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 text-[10px] font-black text-gray-400 hover:text-gray-700 uppercase tracking-[0.2em]">Hủy bỏ</button>
        </div>
      </div>
    </div>
  );
};